import { describe, expect, it, vi } from "vitest";

import { REQUESTS_PER_WINDOW, allowRequest, isSameOrigin } from "./guard";
import {
  SCORING_MODEL,
  ScoringBusyError,
  ScoringRefusedError,
  parseScore,
  scoreProduction,
} from "./score";
import { transcribeSlovak } from "./transcribe";

function stubFetch(
  reply: { finish_reason?: string; content?: unknown; refusal?: string },
  status = 200,
) {
  const fetchImpl = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: reply.finish_reason ?? "stop",
            message: { content: reply.content, refusal: reply.refusal },
          },
        ],
      }),
      { status },
    ),
  );
  return { config: { apiKey: "key", fetchImpl }, fetchImpl };
}

function sentBody(fetchImpl: ReturnType<typeof vi.fn>) {
  return JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
}

describe("parseScore", () => {
  it("clamps to the scale and derives the level from the overall score", () => {
    const score = parseScore(
      JSON.stringify({
        content: 120,
        coherence: 40,
        grammar: -5,
        lexis: 35.6,
        score: 33,
        feedback: "Good.",
        usage: {
          aspect: { right: 3, wrong: 1 },
          wordOrder: { right: 0, wrong: 0 },
          vocabulary: { right: -2, wrong: 500 },
        },
      }),
      false,
    );
    expect(score.criteria).toEqual({
      content: 100,
      coherence: 40,
      grammar: 0,
      lexis: 36,
    });
    expect(score.level).toBe("B1");
    expect(score.usage).toEqual({
      aspect: { right: 3, wrong: 1 },
      vocabulary: { right: 0, wrong: 200 },
    });
  });

  it("rejects a reply without numbers", () => {
    expect(() => parseScore(JSON.stringify({ score: "high" }), false)).toThrow();
  });
});

describe("scoreProduction", () => {
  const reply = JSON.stringify({
    content: 30,
    coherence: 25,
    grammar: 20,
    lexis: 25,
    fluency: 30,
    score: 26,
    feedback: "Clear. Use **na trhu**.",
  });

  it("asks for the spoken schema and keeps the learner text inside answer tags", async () => {
    const { config, fetchImpl } = stubFetch({ content: reply });
    const result = await scoreProduction(config, {
      kind: "speakPhoto",
      prompt: "Opíšte fotku.",
      response: "Na fotke je trh.",
      durationSeconds: 30,
      imageUrl: "https://images.unsplash.com/photo-1",
    });

    expect(fetchImpl.mock.calls[0]?.[0]).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    );
    expect(fetchImpl.mock.calls[0]?.[1]?.headers.Authorization).toBe("Bearer key");
    const body = sentBody(fetchImpl);
    expect(body.model).toBe(SCORING_MODEL);
    expect(body.provider.require_parameters).toBe(true);
    expect(body.response_format.json_schema.schema.required).toContain("fluency");
    const [image, text] = body.messages[1].content;
    expect(image.image_url.url).toBe("https://images.unsplash.com/photo-1");
    expect(text.text).toContain("<answer>\nNa fotke je trh.\n</answer>");
    expect(text.text).toContain("8 words per minute");
    expect(result.criteria.fluency).toBe(30);
    expect(result.level).toBe("A2");
  });

  it("uses the model it is given", async () => {
    const { config, fetchImpl } = stubFetch({ content: reply });
    await scoreProduction(
      { ...config, model: "moonshotai/kimi-k3.1-pro" },
      { kind: "writePhoto", prompt: "x", response: "y" },
    );
    expect(sentBody(fetchImpl).model).toBe("moonshotai/kimi-k3.1-pro");
  });

  it("reads a reply the model wrapped in a code fence", async () => {
    const { config } = stubFetch({
      content: `Here you go:\n\`\`\`json\n${reply}\n\`\`\``,
    });
    const result = await scoreProduction(config, {
      kind: "speakPhoto",
      prompt: "x",
      response: "y",
    });
    expect(result.score).toBe(26);
  });

  it("never forwards a photo from another host", async () => {
    const { config, fetchImpl } = stubFetch({ content: reply });
    await scoreProduction(config, {
      kind: "writePhoto",
      prompt: "x",
      response: "y",
      imageUrl: "https://attacker.example/a.png",
    });
    const content = sentBody(fetchImpl).messages[1].content;
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe("text");
  });

  it("raises on a refusal instead of reading empty content", async () => {
    for (const refused of [{ finish_reason: "content_filter" }, { refusal: "No." }]) {
      const { config } = stubFetch(refused);
      await expect(
        scoreProduction(config, { kind: "writePhoto", prompt: "x", response: "y" }),
      ).rejects.toBeInstanceOf(ScoringRefusedError);
    }
  });

  it("raises when the reply was cut off", async () => {
    const { config } = stubFetch({ finish_reason: "length", content: '{"content": 3' });
    await expect(
      scoreProduction(config, { kind: "writePhoto", prompt: "x", response: "y" }),
    ).rejects.toThrow("out of tokens");
  });

  it("tells a rate limit from other failures", async () => {
    const busy = stubFetch({}, 429);
    await expect(
      scoreProduction(busy.config, { kind: "writePhoto", prompt: "x", response: "y" }),
    ).rejects.toBeInstanceOf(ScoringBusyError);

    const down = stubFetch({}, 500);
    await expect(
      scoreProduction(down.config, { kind: "writePhoto", prompt: "x", response: "y" }),
    ).rejects.toThrow("500");
  });
});

describe("transcribeSlovak", () => {
  it("returns the text and the last word's end time", async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ text: " Dobrý deň. ", words: [{ end: 0.6 }, { end: 1.4 }] }),
        ),
      );
    const transcript = await transcribeSlovak(new Blob(["x"]), "key", fetchStub);
    expect(transcript).toEqual({ text: "Dobrý deň.", durationSeconds: 1.4 });
    const form = fetchStub.mock.calls[0]?.[1]?.body as FormData;
    expect(form.get("language_code")).toBe("sk");
  });

  it("throws when the service fails", async () => {
    const fetchStub = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    await expect(transcribeSlovak(new Blob(["x"]), "key", fetchStub)).rejects.toThrow();
  });
});

describe("guard", () => {
  it("caps requests per key within the window", () => {
    const key = `test-${Math.random()}`;
    for (let index = 0; index < REQUESTS_PER_WINDOW; index++) {
      expect(allowRequest(key, 1_000)).toBe(true);
    }
    expect(allowRequest(key, 1_000)).toBe(false);
    expect(allowRequest(key, 1_000 + 11 * 60 * 1000)).toBe(true);
  });

  it("only accepts posts from the page's own origin", () => {
    const post = (origin?: string) =>
      new Request("https://www.slovak.wiki/api/level-test/score", {
        method: "POST",
        headers: origin ? { origin } : {},
      });
    expect(isSameOrigin(post("https://www.slovak.wiki"))).toBe(true);
    expect(isSameOrigin(post("https://evil.example"))).toBe(false);
    expect(isSameOrigin(post())).toBe(false);
  });
});
