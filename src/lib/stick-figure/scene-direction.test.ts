import { describe, expect, it } from "vitest";

import { heldProps, propForSentence } from "./props";
import { castFor, directScene, type DirectedLine } from "./scene-direction";
import { STAGE_PADDING, stageMarks } from "./stage-layout";
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
});

describe("props in hand", () => {
  it("brings out no cup for an order", () => {
    expect(propForSentence("Ja si dám čaj.")).toBeUndefined();
    expect(propForSentence("Dáte si kávu?")).toBe("cup");
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
