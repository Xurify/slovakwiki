import { describe, expect, it } from "vitest";

import { arrowOrder, clipBox, verticalNeighbour } from "./thing-order";

const hit = (id: string, x: number, y: number, width = 20, height = 20) => ({
  id,
  box: { x, y, width, height },
});

describe("arrowOrder", () => {
  it("steps right by each box's centre, never further left", () => {
    // The studio in telling-time: a wide clock above, then a lamp and the notebook below it.
    const order = arrowOrder([
      hit("hodiny", 190, 40, 60, 60),
      hit("lampa", 225, 150, 24, 60),
      hit("notebook", 190, 170, 26, 12),
    ]).map(({ id }) => id);
    expect(order).toEqual(["notebook", "hodiny", "lampa"]);
  });

  it("goes along the park by centre, whatever the heights", () => {
    const order = arrowOrder([
      hit("kopec", 100, 80, 200, 60),
      hit("lampa", 180, 120, 10, 80),
      hit("oblak", 150, 20, 40, 20),
    ]).map(({ id }) => id);
    expect(order).toEqual(["oblak", "lampa", "kopec"]);
  });

  it("puts the higher of two stacked boxes first", () => {
    const order = arrowOrder([hit("rastlina", 300, 200), hit("polica", 300, 100)]).map(
      ({ id }) => id,
    );
    expect(order).toEqual(["polica", "rastlina"]);
  });

  it("never steps left in any scene", () => {
    const hits = Array.from({ length: 40 }, (_, index) =>
      hit(
        `t${index}`,
        (index * 137) % 900,
        (index * 53) % 250,
        10 + (index % 7) * 30,
        20,
      ),
    );
    const centres = arrowOrder(hits).map(({ box }) => box.x + box.width / 2);
    centres
      .slice(1)
      .forEach((centre, index) => expect(centre).toBeGreaterThanOrEqual(centres[index]));
  });
});

describe("verticalNeighbour", () => {
  const ordered = arrowOrder([
    hit("polica", 300, 100),
    hit("rastlina", 302, 200),
    hit("okno", 500, 90),
  ]);
  it("goes down to the nearest box below and back up", () => {
    const shelf = ordered.findIndex(({ id }) => id === "polica");
    const plant = verticalNeighbour(ordered, shelf, 1);
    expect(ordered[plant].id).toBe("rastlina");
    expect(verticalNeighbour(ordered, plant, -1)).toBe(shelf);
  });
  it("stays put with nothing above", () => {
    const shelf = ordered.findIndex(({ id }) => id === "polica");
    expect(verticalNeighbour(ordered, shelf, -1)).toBe(shelf);
  });
});

describe("clipBox", () => {
  it("cuts the park's river to the part of the drawing the stage shows", () => {
    const view = { x: 180, y: 0, width: 600, height: 300 };
    expect(clipBox({ x: -140, y: 200, width: 1240, height: 60 }, view, 5)).toEqual({
      x: 185,
      y: 200,
      width: 590,
      height: 60,
    });
  });
  it("leaves a box inside alone", () => {
    const box = { x: 300, y: 100, width: 40, height: 40 };
    expect(clipBox(box, { x: 0, y: 0, width: 960, height: 300 }, 5)).toEqual(box);
  });
});
