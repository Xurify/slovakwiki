import { describe, expect, it } from "vitest";

import { arrowOrder, clipBox, tapOrder, verticalNeighbour } from "./thing-order";

const hit = (id: string, x: number, y: number, width = 20, height = 20) => ({
  id,
  box: { x, y, width, height },
});

describe("arrowOrder", () => {
  it("goes along the wall first, then along the floor", () => {
    // The studio in telling-time: a wide clock above, then a lamp and the notebook below it.
    const order = arrowOrder([
      hit("hodiny", 190, 40, 60, 60),
      hit("lampa", 225, 150, 24, 60),
      hit("notebook", 190, 170, 26, 12),
    ]).map(({ id }) => id);
    expect(order).toEqual(["hodiny", "notebook", "lampa"]);
  });

  it("keeps the home's wall and its floor apart", () => {
    // By centre alone it went robot, hrnček, vankúš, obraz, miska, pohovka: up and down the room.
    const order = arrowOrder([
      hit("robot", 400, 120, 40, 110),
      hit("obraz", 560, 30, 60, 50),
      hit("okno", 160, 30, 90, 60),
      hit("pohovka", 516, 148, 132, 86),
      hit("miska", 370, 240, 20, 10),
      hit("koberec", 256, 248, 360, 52),
    ]).map(({ id }) => id);
    expect(order).toEqual(["okno", "obraz", "koberec", "miska", "robot", "pohovka"]);
  });

  it("goes along the café's top row before coming down", () => {
    const order = arrowOrder([
      hit("rastlina", 186, 30, 30, 70),
      hit("okno", 42, 24, 192, 186),
      hit("lampa", 450, 40, 32, 20),
      hit("stol", 420, 194, 60, 84),
      hit("lavicka", 392, 174, 180, 54),
    ]).map(({ id }) => id);
    expect(order).toEqual(["okno", "rastlina", "lampa", "lavicka", "stol"]);
  });

  it("puts the higher of two stacked boxes first", () => {
    const order = arrowOrder([hit("rastlina", 300, 200), hit("polica", 300, 100)]).map(
      ({ id }) => id,
    );
    expect(order).toEqual(["polica", "rastlina"]);
  });

  it("never steps left within a row", () => {
    const hits = Array.from({ length: 40 }, (_, index) =>
      hit(
        `t${index}`,
        (index * 137) % 900,
        (index * 53) % 250,
        10 + (index % 7) * 30,
        20,
      ),
    );
    const ordered = arrowOrder(hits);
    const high = (box: { y: number; height: number }) => box.y + box.height / 2 < 150;
    ordered.slice(1).forEach((next, index) => {
      const was = ordered[index];
      if (high(was.box) === high(next.box))
        expect(next.box.x).toBeGreaterThanOrEqual(was.box.x);
      else expect(high(was.box)).toBe(true);
    });
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

describe("tapOrder", () => {
  const thing = (behind = false, of?: string[]) => ({ behind, of });
  it("puts the houses under the tram shelter in front of them, though each house is smaller", () => {
    const order = tapOrder([
      { id: "zastavka", box: { x: 200, y: 54, width: 160, height: 234 }, thing: thing() },
      { id: "dom", box: { x: 240, y: 82, width: 130, height: 144 }, thing: thing(true) },
      { id: "kos", box: { x: 359, y: 250, width: 16, height: 36 }, thing: thing() },
    ]).map(({ id }) => id);
    expect(order).toEqual(["dom", "zastavka", "kos"]);
  });
  it("lays the set's things over the backdrop's, and the smaller over the bigger", () => {
    const order = tapOrder([
      { id: "stolicka", box: { x: 800, y: 220, width: 20, height: 50 }, thing: thing(false, ["stool-1"]) },
      { id: "pult", box: { x: 782, y: 196, width: 150, height: 82 }, thing: thing(false, ["bar"]) },
      { id: "polica", box: { x: 800, y: 28, width: 128, height: 104 }, thing: thing() },
      { id: "kolac", box: { x: 843, y: 62, width: 26, height: 32 }, thing: thing() },
    ]).map(({ id }) => id);
    expect(order).toEqual(["polica", "kolac", "pult", "stolicka"]);
  });
});
