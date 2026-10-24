import { describe, expect, it } from "vitest";

import { characterIdForSpeaker } from "$lib/catalog/lessons/character-ids";
import { demonstrativesEpisode } from "$lib/catalog/listening/episodes/demonstratives";
import { heldProps, propForSentence } from "./props";
import { castFor, directScene, type DirectedLine } from "./scene-direction";
import { STAGE_PADDING, figureWidth, stageMarks } from "./stage-layout";
import { takesFrom, type StageLine } from "./staging";

describe("castFor", () => {
  const order: DirectedLine[] = [
    { characterId: "waiter", slovak: "Dobrý deň. Dáte si kávu?" },
    { characterId: "anna", slovak: "Áno, prosím." },
    { characterId: null, slovak: "ĎA-ku-jem" },
    { characterId: "alex", slovak: "Ja si dám čaj." },
  ];

  it("puts staff at the counter end where there is a counter", () => {
    expect(castFor(order, "cafe")).toEqual(["anna", "alex", "waiter"]);
    expect(castFor(order, "plaza")).toEqual(["waiter", "anna", "alex"]);
  });
});

describe("stageMarks", () => {
  it("centres a cast that is all on stage", () => {
    const { marks, width } = stageMarks(["anna", "alex"], {}, 1000);
    const left = marks.anna ?? 0;
    const right = (marks.alex ?? 0) + width;

    expect(left + right).toBeCloseTo(1000, 5);
  });

  it("centres whoever is there, leaving room for someone still to come", () => {
    const wide = stageMarks(["anna", "alex", "waiter"], { waiter: 1 }, 1040);
    const duo = ((wide.marks.anna ?? 0) + (wide.marks.alex ?? 0) + wide.width) / 2;
    expect(duo).toBeCloseTo(520, 5);

    const phone = stageMarks(["anna", "alex", "waiter"], { waiter: 1 }, 366);
    expect((phone.marks.waiter ?? 0) + phone.width).toBeLessThanOrEqual(
      366 - STAGE_PADDING + 0.001,
    );
    expect(phone.marks.anna ?? 0).toBeGreaterThanOrEqual(STAGE_PADDING);
  });
  it("keeps the cast in step with the stage's height, so a phone's stage is not all cast", () => {
    expect(figureWidth(2, 1040)).toBe(150);
    expect(figureWidth(2, 366, 183)).toBeCloseTo(91.5, 5);
    expect(figureWidth(3, 366, 183)).toBeCloseTo(67.1, 1);
  });
});

describe("props in hand", () => {
  it("brings out no cup for an order", () => {
    expect(propForSentence("Ja si dám čaj.")).toBeUndefined();
    expect(propForSentence("Dáte si kávu?")).toBe("cup");
  });

  it("brings out nothing that is to be brought another day", () => {
    expect(propForSentence("Zajtra si prineste fotku rodiny.")).toBeUndefined();
    expect(propForSentence("Dobre, prinesiem fotku.")).toBeUndefined();
    expect(propForSentence("Pozri, to sú fotky z leta.")).toBe("camera");
  });

  it("hands a prop to whoever claims it", () => {
    const lines: StageLine[] = [
      { characterId: "anna", slovak: "Mimochodom, čie sú tie kľúče? Tvoje?" },
      { characterId: "alex", slovak: "Áno, moje! Ďakujem." },
    ];
    const registration: StageLine[] = [
      { characterId: "maria", slovak: "Ste tu na registráciu?" },
      { characterId: "alex", slovak: "Moje číslo je nula deväť nula." },
    ];

    expect(takesFrom(lines, 1)).toBe("anna");
    expect(takesFrom(registration, 1)).toBeUndefined();
    expect(
      heldProps([
        { characterId: "anna", props: ["keys"] },
        { characterId: "alex", props: [undefined], takesFrom: "anna" },
      ]),
    ).toEqual([{ anna: "keys" }, { alex: "keys" }]);
  });

  it("reaches out for what it takes", () => {
    const direction = directScene(
      [
        { characterId: "anna", slovak: "Mimochodom, čie sú tie kľúče? Tvoje?" },
        { characterId: "alex", slovak: "Áno, moje! Ďakujem." },
      ],
      "home",
    );

    expect(direction.plans[1].beats[0].gesture).toBe("show");
    expect(direction.held[1]).toEqual({ alex: "keys" });
  });
});

describe("handing things over", () => {
  it("gives what the speaker holds on Nech sa páči, and the one given it keeps it", () => {
    const direction = directScene(
      [
        { characterId: "anna", slovak: "Tak tamtie, prosím." },
        { characterId: "lucia", props: ["basket"], slovak: "Nech sa páči." },
        { characterId: "marek", slovak: "Anna vždy kupuje slovenské jahody." },
      ],
      "market",
    );

    expect(direction.stagings[1].gives).toBe("anna");
    expect(direction.stagings[1].reactions).toEqual([
      expect.objectContaining({ characterId: "anna", gesture: "show" }),
    ]);
    expect(direction.held[1]).toEqual({ lucia: "basket" });
    expect(direction.handed[1]).toEqual({ anna: "basket" });
    expect(direction.held[2]).toEqual({ anna: "basket" });
  });

  it("gives nothing when nothing is in hand", () => {
    const direction = directScene(
      [
        { characterId: "alex", slovak: "Môžem?" },
        { characterId: "waiter", slovak: "Nech sa páči." },
      ],
      "cafe",
    );

    expect(direction.stagings[1].gives).toBeUndefined();
    expect(direction.handed[1]).toBeUndefined();
  });

  it("does not point at a present that was given away", () => {
    const direction = directScene(
      [
        { characterId: "marek", slovak: "Presne. A to jablko je pre teba." },
        { characterId: "anna", slovak: "Ďakujem! Tento podcast má aj jedlo." },
      ],
      "studio",
    );

    expect(direction.held[1]).toEqual({ anna: "apple" });
    expect(direction.stagings[1].looksAt).toBeUndefined();
  });
});

describe("words for drawn things", () => {
  it("point at the thing in the room instead of bringing one out", () => {
    const home = directScene(
      [{ characterId: "anna", slovak: "Je v tej taške." }],
      "home",
    );
    const studio = directScene(
      [{ characterId: "marek", slovak: "Anna, mám tu tašku." }],
      "studio",
    );

    expect(home.held[0]).toEqual({});
    expect(home.plans[0].beats.some((beat) => beat.point?.target.kind === "thing")).toBe(
      true,
    );
    expect(studio.held[0]).toEqual({ marek: "bag" });
  });
});

describe("a series keeps its cast in place", () => {
  it("stands the hosts in the order given, whoever speaks first", () => {
    const lines: DirectedLine[] = [
      { characterId: "marek", slovak: "Anna, mám tu tašku." },
      { characterId: "anna", slovak: "Dobre. Čo je to?" },
    ];

    expect(castFor(lines, "studio")).toEqual(["marek", "anna"]);
    expect(castFor(lines, "studio", ["anna", "marek", "lucia"])).toEqual([
      "anna",
      "marek",
    ]);
  });
});

describe("the podcast at the market", () => {
  it("points this cheese near, that cheese far, and hands Anna the strawberries", () => {
    const market = demonstrativesEpisode.chapters.find(({ id }) =>
      id.endsWith("market"),
    )!;
    const direction = directScene(
      market.lines.map((line) => ({
        characterId: characterIdForSpeaker(line.speaker),
        props: line.props,
        slovak: line.slovak,
      })),
      "market",
      demonstrativesEpisode.speakers.map(characterIdForSpeaker),
    );
    const copies = direction.plans.map((plan) =>
      plan.beats.flatMap(({ point }) =>
        point?.target.kind === "thing" ? [`${point.target.id}#${point.target.copy}`] : [],
      ),
    );

    expect(direction.cast).toEqual(["anna", "marek", "lucia"]);
    expect(copies.slice(2, 6)).toEqual([["syr#0"], ["syr#1"], ["syr#1"], ["syr#1"]]);
    expect(copies[7]).toEqual(["jahody#0", "jahody#1"]);
    expect(direction.held.at(-1)).toEqual({ anna: "basket" });
  });
});

describe("the tram stop", () => {
  const lines: DirectedLine[] = [
    { characterId: "alex", props: [null], slovak: "Máš dáždnik?" },
    { characterId: "anna", slovak: "Mám. Poď sem, pod dáždnik." },
    { characterId: "alex", slovak: "Ďakujem. Kde je zastávka?" },
    { characterId: "anna", slovak: "Tam, pri lavičke. Poďme!" },
    { characterId: "alex", slovak: "Aha, už ide!" },
    {
      characterId: "anna",
      props: [null, null],
      slovak: "V električke. Môžeš platiť kartou.",
    },
    { characterId: "anna", slovak: "Konečne! Nastúpme." },
  ];
  const { held, stagings } = directScene(lines, "street");

  it("brings out the umbrella for whoever has one, and keeps it up through the walk", () => {
    expect(propForSentence("Nemám dáždnik.")).toBeUndefined();
    expect(held[0].alex).toBeUndefined();
    expect(held[1].anna).toBe("umbrella");
    expect(stagings[1].approach).toEqual({ characterId: "alex", toward: 1 });
    expect(held[3].anna).toBe("umbrella");
    expect(held[5].anna).toBe("umbrella");
  });

  it("walks everyone over to the bench on Poďme, not on a line that names nothing drawn", () => {
    expect(stagings[1].goTo).toBeUndefined();
    expect(stagings[3].goTo).toBe("lavicka");
  });

  it("brings the tram in on už ide, with everyone watching it come", () => {
    expect(stagings[4].arrives).toBe("tram");
    expect(stagings[4].facing).toEqual({ alex: 1, anna: 1 });
  });

  it("gets on once it is there, without anyone walking off", () => {
    expect(stagings[6].boards).toBe(true);
    expect(stagings[6].exit).toBeUndefined();
  });

  it("has no tram on the square", () => {
    const square = directScene(lines, "plaza").stagings;
    expect(square[4].arrives).toBeUndefined();
    expect(square[6].boards).toBeUndefined();
  });
});

describe("the podcast studio", () => {
  it("keeps the hosts at their mics while Marek shows Anna what is in the bag", () => {
    const bag = demonstrativesEpisode.chapters.find((chapter) =>
      chapter.id.endsWith("bag"),
    );
    const lines = (bag?.lines ?? []).map((line) => ({
      characterId: characterIdForSpeaker(line.speaker),
      props: line.props,
      slovak: line.slovak,
    }));
    const moves = (setting: "default" | "studio") =>
      directScene(lines, setting).stagings.filter(
        (staging) => staging.approach || staging.goTo,
      ).length;

    expect(moves("default")).toBeGreaterThan(0);
    expect(moves("studio")).toBe(0);
  });
});
