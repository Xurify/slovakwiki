import { describe, expect, it } from "vitest";

import { DAY_TALKS, dayTurns } from "./scene-day";
import { directScene } from "./scene-direction";
import { replyChoices, walkTalk, type TalkNode } from "./talk";

const NODES: TalkNode[] = [
  {
    id: "hello",
    says: [],
    replies: [
      { line: { english: "Hi.", slovak: "Ahoj." }, next: "how" },
      {
        line: { english: "Good day.", slovak: "Dobrý deň." },
        miss: { reaction: "laugh", why: "Too formal." },
      },
    ],
  },
  {
    id: "how",
    says: [{ english: "How are you?", slovak: "Ako sa máš?" }],
    replies: [
      { line: { english: "Fine.", slovak: "Dobre." }, next: "fine" },
      { line: { english: "Tired.", slovak: "Som unavený." }, next: "tired" },
    ],
  },
  { id: "fine", says: [{ english: "Great!", slovak: "Super!" }] },
  { id: "tired", says: [{ english: "Have a coffee.", slovak: "Daj si kávu." }] },
];

describe("a talk", () => {
  it("runs along the first reply that fits until Alex picks another", () => {
    const first = walkTalk(NODES);
    expect(first.lines.map((line) => line.slovak)).toEqual([
      "Ahoj.",
      "Ako sa máš?",
      "Dobre.",
      "Super!",
    ]);
    expect([...first.turns.keys()]).toEqual([0, 2]);

    const tired = walkTalk(NODES, { how: 1 });
    expect(tired.lines.map((line) => line.slovak)).toEqual([
      "Ahoj.",
      "Ako sa máš?",
      "Som unavený.",
      "Daj si kávu.",
    ]);
  });

  it("offers every reply to pick, with the ones that fit right", () => {
    expect(replyChoices(NODES[0])).toEqual({
      answerIds: ["0"],
      choices: [
        { id: "0", label: "Ahoj.", whyWrong: undefined },
        { id: "1", label: "Dobrý deň.", whyWrong: "Too formal." },
      ],
    });
  });
});

describe("a day on the square", () => {
  it("has four talks whose every branch reaches an end", () => {
    expect(DAY_TALKS.map((talk) => talk.who)).toEqual([
      "marek",
      "lucia",
      "anna",
      "maria",
    ]);

    for (const talk of DAY_TALKS) {
      const ids = new Set(talk.nodes.map((node) => node.id));
      expect(ids.size, talk.id).toBe(talk.nodes.length);
      for (const node of talk.nodes) {
        for (const reply of node.replies ?? []) {
          if (reply.miss) {
            expect(
              reply.next,
              `${talk.id}/${node.id}: a slip leads nowhere`,
            ).toBeUndefined();
            expect(reply.miss.why.length).toBeGreaterThan(0);
            expect(reply.miss.answer, `${talk.id}/${node.id}: answered`).toBeDefined();
          } else {
            expect(
              ids.has(reply.next ?? ""),
              `${talk.id}/${node.id} → ${reply.next}`,
            ).toBe(true);
          }
        }
        const fitting = (node.replies ?? []).filter((reply) => !reply.miss);
        if (node.replies)
          expect(fitting.length, `${talk.id}/${node.id}`).toBeGreaterThan(0);
      }

      // Every node is reachable from the first.
      const reached = new Set<string>([talk.nodes[0].id]);
      for (let pass = 0; pass < talk.nodes.length; pass += 1) {
        for (const node of talk.nodes.filter(({ id }) => reached.has(id))) {
          for (const reply of node.replies ?? []) if (reply.next) reached.add(reply.next);
        }
      }
      expect([...reached].sort(), talk.id).toEqual([...ids].sort());
    }
  });

  it("ends every talk on the other person's goodbye, so they walk off", () => {
    for (const talk of DAY_TALKS) {
      for (const node of talk.nodes.filter((entry) => !entry.replies)) {
        const { lines } = directScene(
          [
            { characterId: "alex", slovak: "Ahoj!", stays: true },
            ...node.says.map(({ slovak }) => ({ characterId: talk.who, slovak })),
          ],
          talk.setting,
        );
        expect(lines.at(-1)?.staging.exit, `${talk.id}/${node.id}`).toBeDefined();
      }
    }
  });

  it("keeps ty for friends and vy for the others in what fits", () => {
    const fitting = (who: string) =>
      DAY_TALKS.filter((talk) => talk.who === who)
        .flatMap((talk) => talk.nodes)
        .flatMap((node) => node.replies ?? [])
        .filter((reply) => !reply.miss)
        .map((reply) => reply.line.slovak)
        .join(" ");

    for (const friend of ["marek", "anna"]) {
      expect(fitting(friend)).not.toMatch(/\b(vy|vám|vami|Dovidenia|Dobrý deň)\b/);
    }
    for (const other of ["lucia", "maria"]) {
      expect(fitting(other)).not.toMatch(/\b(ty|tebe|tebou|Ahoj|Čau|Maj sa)\b/);
    }
  });

  it("voices every line once: theirs, their answers to slips, and Alex's that fit", () => {
    const turns = dayTurns();
    expect(new Set(turns.map((turn) => turn.id)).size).toBe(turns.length);
    expect(turns.some((turn) => turn.slovak === "Dobrý deň, Marek.")).toBe(false);
    expect(
      turns.find((turn) => turn.slovak === "Ja? Ja nie som na predaj!")?.speaker,
    ).toBe("Lucia");
    expect(turns.find((turn) => turn.slovak === "Ahoj, Marek!")?.speaker).toBe("You");
  });
});
