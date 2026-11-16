import { describe, expect, it } from "vitest";

import { drawn, withDrawn } from "./thing-words";

const board = drawn(
  { english: "board", gender: "feminine", id: "doska", word: "doska" },
  [100, 150, 40, 8],
);
const carrot = {
  ...drawn(
    { english: "carrot", gender: "feminine", id: "mrkva", word: "mrkva" },
    [110, 144, 16, 6],
  ),
  onto: "doska",
};
const knife = {
  ...drawn(
    { english: "knife", gender: "masculine-inanimate", id: "noz", word: "nôž" },
    [128, 146, 12, 4],
  ),
  onto: "doska",
};

describe("withDrawn", () => {
  it("names what lies on a thing on that thing's card", () => {
    // Imperative's kitchen: the carrot and the knife on the board were tapped as doska alone.
    const things = withDrawn([board, carrot, knife], {});
    expect(things.map(({ id }) => id)).toEqual(["doska"]);
    expect(things[0].lying?.map(({ word }) => word)).toEqual(["mrkva", "nôž"]);
  });

  it("lets a thing go once it is lifted off", () => {
    const lifted = { ...carrot, box: { ...carrot.box, y: 60 } };
    const things = withDrawn([board, lifted, knife], {});
    expect(things.map(({ id }) => id)).toEqual(["doska", "mrkva"]);
    expect(things[0].lying?.map(({ id }) => id)).toEqual(["noz"]);
  });
});
