import { describe, expect, it } from "vitest";

import { characterIdForSpeaker } from "$lib/catalog/lessons/character-ids";
import { demonstrativesEpisode } from "$lib/catalog/listening/episodes/demonstratives";
import { readLines, type StageLine } from "./line-reading";
import { heldProps, propForSentence } from "./props";
import { castFor, directScene, type DirectedLine } from "./scene-direction";
import { STAGE_PADDING, figureWidth, stageMarks } from "./stage-layout";

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

describe("lines to the listeners", () => {
  it("faces the front for a riddle or a hello to everyone, not for a hello with a name in it", () => {
    const direction = directScene(
      [
        { characterId: "anna", slovak: "Tak kto bol v štúdiu celý deň? Hádajte s nami!" },
        { characterId: "marek", slovak: "Ahojte! Prepáč, Anna, meškám." },
        { characterId: "marek", slovak: "A ja som Marek. Ahojte!" },
        { characterId: "marek", slovak: "Ďakujem, Anna. Maj sa! Teraz späť do štúdia." },
      ],
      "studio",
    );

    expect(direction.lines.map((line) => line.staging.audience ?? false)).toEqual([
      true,
      false,
      true,
      false,
    ]);
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

    expect(readLines(lines, ["anna", "alex"])[1].takes).toBe("anna");
    expect(readLines(registration, ["alex", "maria"])[1].takes).toBeUndefined();
    expect(
      heldProps([
        { characterId: "anna", props: ["keys"] },
        { characterId: "alex", props: [undefined], takes: "anna" },
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

    expect(direction.lines[1].plan.beats[0].gesture).toBe("show");
    expect(direction.lines[1].held).toEqual({ alex: "keys" });
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

    expect(direction.lines[1].staging.gives).toBe("anna");
    expect(direction.lines[1].staging.reactions).toEqual([
      expect.objectContaining({ characterId: "anna", gesture: "show" }),
    ]);
    expect(direction.lines[1].held).toEqual({ lucia: "basket" });
    expect(direction.lines[1].handed).toEqual({ anna: "basket" });
    expect(direction.lines[2].held).toEqual({ anna: "basket" });
  });

  it("lets whoever walks on carry in what their hello brings out", () => {
    const direction = directScene(
      [
        { characterId: "robot", slovak: "Dnes príde. Uvidíš." },
        { characterId: "marek", props: ["suitcase"], slovak: "Dobrý večer!" },
      ],
      "home",
    );

    expect(direction.lines[0].staging.enter?.characterId).toBe("marek");
    expect(direction.lines[0].held).toEqual({ marek: "suitcase" });
  });

  it("brings a called dog over past whoever stands between", () => {
    const direction = directScene(
      [
        { characterId: "dog", slovak: "Haf!" },
        { characterId: "robot", slovak: "Ja viem." },
        { characterId: "marek", slovak: "Dunčo! Poď sem!", to: "dog" },
      ],
      "home",
    );

    expect(direction.lines[2].staging.approach?.characterId).toBe("dog");
  });

  it("gives nothing when nothing is in hand", () => {
    const direction = directScene(
      [
        { characterId: "alex", slovak: "Môžem?" },
        { characterId: "waiter", slovak: "Nech sa páči." },
      ],
      "cafe",
    );

    expect(direction.lines[1].staging.gives).toBeUndefined();
    expect(direction.lines[1].handed).toBeUndefined();
  });

  it("does not point at a present that was given away", () => {
    const direction = directScene(
      [
        { characterId: "marek", slovak: "Presne. A to jablko je pre teba." },
        { characterId: "anna", slovak: "Ďakujem! Mám hlad." },
      ],
      "studio",
    );

    expect(direction.lines[1].held).toEqual({ anna: "apple" });
    expect(direction.lines[1].staging.looksAt).toBeUndefined();
  });
});

describe("under the umbrella", () => {
  it("brings the one called in under it right up to the speaker", () => {
    const direction = directScene(
      [
        { characterId: "alex", slovak: "Prší! Máš dáždnik?" },
        { characterId: "anna", slovak: "Mám. Poď sem, pod dáždnik." },
        { characterId: "alex", slovak: "Ďakujem." },
      ],
      "street",
    );

    expect(direction.lines[1].staging.approach).toEqual({
      characterId: "alex",
      close: true,
      toward: 1,
    });
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

    expect(home.lines[0].held).toEqual({});
    expect(
      home.lines[0].plan.beats.some((beat) => beat.point?.target.kind === "thing"),
    ).toBe(true);
    expect(studio.lines[0].held).toEqual({ marek: "bag" });
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
  it("points this cheese near, that cheese far", () => {
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
    const copies = direction.lines.map(({ plan }) =>
      plan.beats.flatMap(({ point }) =>
        point?.target.kind === "thing" ? [`${point.target.id}#${point.target.copy}`] : [],
      ),
    );

    expect(direction.cast).toEqual(["anna", "marek", "lucia"]);
    expect(copies.slice(2, 6)).toEqual([["syr#0"], ["syr#1"], ["syr#1"], ["syr#1"]]);
    expect(copies[7]).toEqual(["jahody#0", "jahody#1"]);
    expect(direction.lines.at(-1)?.held).toEqual({});
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
  const directed = directScene(lines, "street").lines;
  const held = directed.map((line) => line.held);
  const stagings = directed.map((line) => line.staging);

  it("brings out the umbrella for whoever has one, and keeps it up through the walk", () => {
    expect(propForSentence("Nemám dáždnik.")).toBeUndefined();
    expect(held[0].alex).toBeUndefined();
    expect(held[1].anna).toBe("umbrella");
    expect(stagings[1].approach).toEqual({ characterId: "alex", close: true, toward: 1 });
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
    const square = directScene(lines, "plaza").lines;
    expect(square[4].staging.arrives).toBeUndefined();
    expect(square[6].staging.boards).toBeUndefined();
  });
});

describe("the podcast studio", () => {
  it("keeps the hosts at their mics while Marek shows Anna what is in the bag", () => {
    const bag = demonstrativesEpisode.chapters.find((chapter) =>
      chapter.id.endsWith("bag"),
    );
    const lines = (bag?.lines ?? []).map((line) => ({
      characterId: characterIdForSpeaker(line.speaker),
      props: line.id.endsWith("apple-for-you") ? ["apple" as const] : line.props,
      slovak: line.slovak,
    }));
    const moves = (setting: "default" | "studio") =>
      directScene(lines, setting).lines.filter(
        ({ staging }) => staging.approach || staging.goTo,
      ).length;

    expect(moves("default")).toBeGreaterThan(0);
    expect(moves("studio")).toBe(0);
  });
});

describe("a phone call", () => {
  const lines: DirectedLine[] = [
    { characterId: "anna", slovak: "Marek, telefón!" },
    { characterId: "marek", slovak: "Haló? Ahoj, Lucia!", ring: "call" },
    { characterId: "lucia", slovak: "Prídem neskôr. Jedzte bezo mňa.", overPhone: true },
    { characterId: "marek", slovak: "Dobre. Ahoj!" },
    { characterId: "anna", slovak: "Čo hovorí?" },
  ];

  it("keeps the voice at the far end off the stage", () => {
    expect(directScene(lines, "kitchen").cast).not.toContain("lucia");
  });

  it("holds the phone to the ear of whoever answers, through their goodbye", () => {
    const calls = directScene(lines, "kitchen").lines.map((line) => line.call);

    expect(calls).toEqual([undefined, "marek", "marek", "marek", undefined]);
  });

  it("keeps the call on while someone in the room says something into it", () => {
    const joined: DirectedLine[] = [
      { characterId: "marek", slovak: "Ahoj, Lucia!", ring: "call" },
      { characterId: "lucia", slovak: "Prídem neskôr.", overPhone: true },
      { characterId: "maria", slovak: "Nech príde. Polievky je dosť." },
      { characterId: "lucia", slovak: "Dobre. Ahoj!", overPhone: true },
      { characterId: "marek", slovak: "Ahoj! Príde o pol hodiny." },
      { characterId: "anna", slovak: "Výborne." },
    ];
    const calls = directScene(joined, "kitchen").lines.map((line) => line.call);

    expect(calls).toEqual(["marek", "marek", "marek", "marek", "marek", undefined]);
  });
});

describe("a call a robot makes", () => {
  const lines: DirectedLine[] = [
    { characterId: "robo", slovak: "Rozumiem. Volám Marekovi." },
    { characterId: "robo", slovak: "Ahoj, Marek. Tu je Robo.", ring: "dial" },
    { characterId: "marek", slovak: "Ahoj, Robo. Čo sa deje?", overPhone: true },
    { characterId: "robo", slovak: "Bobík čaká pri okne." },
  ];

  it("is on the call from the line it dials, with no phone in hand", () => {
    const direction = directScene(lines, "home");

    expect(direction.lines.map((line) => line.call)).toEqual([
      undefined,
      "robo",
      "robo",
      "robo",
    ]);
    expect(direction.lines.map((line) => line.held.robo)).not.toContain("phone");
  });

  it("greets the far end without a wave, since a wave cannot be seen down a line", () => {
    const [, hello] = directScene(lines, "home").lines;

    expect(hello.plan.beats.map((beat) => beat.gesture)).not.toContain("wave");
  });
});
