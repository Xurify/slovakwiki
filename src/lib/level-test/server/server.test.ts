import { describe, expect, it, vi } from "vitest";

import { REQUESTS_PER_WINDOW, allowRequest, isSameOrigin } from "./guard";
import { SCORING_MODEL, ScoringRefusedError, parseScore, scoreProduction } from "./score";
import { transcribeSlovak } from "./transcribe";

type Client = Parameters<typeof scoreProduction>[0];

function stubClient(reply: { stop_reason: string; text?: string }) {
  const create = vi.fn().mockResolvedValue({
    stop_reason: reply.stop_reason,
    content: reply.text === undefined ? [] : [{ type: "text", text: reply.text }],
  });
  return { client: { beta: { messages: { create } } } as unknown as Client, create };
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
    const { client, create } = stubClient({ stop_reason: "end_turn", text: reply });
    const result = await scoreProduction(client, {
      kind: "speakPhoto",
      prompt: "Opíšte fotku.",
      response: "Na fotke je trh.",
      durationSeconds: 30,
      imageUrl: "https://images.unsplash.com/photo-1",
    });

    const params = create.mock.calls[0]?.[0];
    expect(params.model).toBe(SCORING_MODEL);
    expect(params.fallbacks).toBe("default");
    expect(params.output_config.format.schema.required).toContain("fluency");
    const [image, text] = params.messages[0].content;
    expect(image.source.url).toBe("https://images.unsplash.com/photo-1");
    expect(text.text).toContain("<answer>\nNa fotke je trh.\n</answer>");
    expect(text.text).toContain("8 words per minute");
    expect(result.criteria.fluency).toBe(30);
    expect(result.level).toBe("A2");
  });

  it("never forwards a photo from another host", async () => {
    const { client, create } = stubClient({ stop_reason: "end_turn", text: reply });
    await scoreProduction(client, {
      kind: "writePhoto",
      prompt: "x",
      response: "y",
      imageUrl: "https://attacker.example/a.png",
    });
    const content = create.mock.calls[0]?.[0].messages[0].content;
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe("text");
  });

  it("raises on a refusal instead of reading empty content", async () => {
    const { client } = stubClient({ stop_reason: "refusal" });
    await expect(
      scoreProduction(client, { kind: "writePhoto", prompt: "x", response: "y" }),
    ).rejects.toBeInstanceOf(ScoringRefusedError);
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
