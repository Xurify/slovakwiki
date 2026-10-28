import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

import { LESSON_CHARACTER_IDS } from "$lib/catalog/lessons/character-ids";
import { startWorld } from "$lib/stick-figure/acts";
import { dressFor } from "$lib/stick-figure/dress";
import { LOOKS } from "$lib/stick-figure/looks";
import { PLACES } from "$lib/stick-figure/places";
import { REST_POSE } from "$lib/stick-figure/pose";
import { restOnTable } from "$lib/stick-figure/reach";
import { solveRig } from "$lib/stick-figure/rig";
import { pieceTop } from "$lib/stick-figure/set-pieces";
import type { StageSetting } from "$lib/stick-figure/stage-setting";
import StickFigure from "./StickFigure.svelte";
import StickFurniture from "./StickFurniture.svelte";
import StickHead from "./StickHead.svelte";
import StickSet from "./StickSet.svelte";
import StudioDesk from "./StudioDesk.svelte";

/**
 * What a viewer sees go wrong at a glance, measured on the drawings
 * themselves rather than on numbers copied from them: headwear off the ears
 * or floating over the hair (the studio headphones came back four times),
 * and hands at rest hovering over a set's table or sunk through it (the
 * table's height used at the studio desk).
 */

type Attrs = Record<string, string>;

function tags(body: string, name: string): Attrs[] {
  return [...body.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "g"))].map((match) =>
    Object.fromEntries(
      [...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]),
    ),
  );
}

const num = (attrs: Attrs, key: string) => Number(attrs[key]);

/** StickHead's skull, in its 64-unit space. */
const SKULL = { cx: 32, cy: 29, rx: 13.2, ry: 15.2 };
/** StickHead's ear (`look.ear`): the middle of the path's box. */
const EAR = { x: 18.1, y: 29.7 };

/** How far out from the skull's edge, at height `y`, a point at `x` is: negative inside. */
function pastSkull(x: number, y: number): number {
  const dy = (y - SKULL.cy) / SKULL.ry;
  const half = SKULL.rx * Math.sqrt(Math.max(0, 1 - dy * dy));
  return Math.abs(x - SKULL.cx) - half;
}

function inEllipse(point: { x: number; y: number }, e: Attrs, slack = 0): boolean {
  const dx = (point.x - num(e, "cx")) / (num(e, "rx") + slack);
  const dy = (point.y - num(e, "cy")) / (num(e, "ry") + slack);
  return dx * dx + dy * dy <= 1;
}

/** The first and last points of a path of M, C and A commands. */
function ends(d: string): {
  from: { x: number; y: number };
  to: { x: number; y: number };
} {
  const numbers = d.match(/-?\d*\.?\d+/g)!.map(Number);
  return {
    from: { x: numbers[0], y: numbers[1] },
    to: { x: numbers[numbers.length - 2], y: numbers[numbers.length - 1] },
  };
}

const HUMANS = LESSON_CHARACTER_IDS.filter((id) => !LOOKS[id].robot && !LOOKS[id].dog);
/** Facing the listeners, and side-on: the cups move with the turn. */
const TURNS = [0, 2.6];

describe("headwear on the head", () => {
  for (const characterId of HUMANS) {
    for (const turn of TURNS) {
      it(`fits ${characterId}'s headphones ${turn ? "side-on" : "from the front"}`, () => {
        const body = render(StickHead, {
          props: { characterId, headphones: true, turn },
        }).body;
        const [far, near] = tags(body, "ellipse").filter((e) =>
          e.class?.startsWith("fill-scene-line"),
        );
        const band = tags(body, "path").find(
          (p) => p.class === "stroke-portrait-ink" && p["stroke-width"] === "3.6",
        );
        expect(near && far && band, "headphones drawn").toBeTruthy();

        // Each cup hugs the head's outline: out past it they slide off, deep in they sink into the face.
        for (const cup of [near, far]) {
          const off = pastSkull(num(cup, "cx"), num(cup, "cy"));
          expect(off, `cup ${off.toFixed(1)} off the skull's edge`).toBeLessThan(0.6);
          expect(off).toBeGreaterThan(-1.8);
        }
        if (LOOKS[characterId].ear)
          expect(inEllipse(EAR, near), "near cup over the ear").toBe(true);

        // The band runs from cup to cup over the top of the hair, as in over-ear headphones, not sunk into it.
        const { from, to } = ends(band!.d);
        expect(inEllipse(from, near, 0.6), "band starts on the near cup").toBe(true);
        expect(inEllipse(to, far, 0.6), "band ends on the far cup").toBe(true);
        const top = Math.min(
          ...band!.d
            .match(/-?\d*\.?\d+/g)!
            .map(Number)
            .filter((_, i) => i % 2 === 1),
        );
        const crown = LOOKS[characterId].crown;
        expect(top - crown, "band floating over the crown").toBeGreaterThanOrEqual(-2);
        expect(top - crown, "band sunk into the hair").toBeLessThanOrEqual(0);
      });
    }

    it(`fits ${characterId}'s headset`, () => {
      const body = render(StickFigure, {
        props: { characterId, dress: dressFor("clear", { headwear: "headset" }) },
      }).body;
      const cup = tags(body, "circle").find(
        (c) => c.class?.startsWith("fill-scene-line") && num(c, "r") > 3,
      );
      const bands = tags(body, "path").filter(
        (p) => p["stroke-width"] === "1.8" && p.d.includes("A13.4"),
      );
      expect(cup && bands.length === 2, "headset drawn").toBeTruthy();

      const asEllipse = { cx: cup!.cx, cy: cup!.cy, rx: cup!.r, ry: cup!.r };
      expect(pastSkull(num(cup!, "cx"), num(cup!, "cy"))).toBeLessThan(1.5);
      if (LOOKS[characterId].ear)
        expect(inEllipse(EAR, asEllipse), "cup over the ear").toBe(true);

      const near = bands.find((band) => ends(band.d).from.x < 20)!;
      expect(inEllipse(ends(near.d).from, asEllipse, 1), "band meets the cup").toBe(true);
      const crown = LOOKS[characterId].crown;
      expect(
        Math.abs(ends(near.d).to.y - crown),
        "band on the crown",
      ).toBeLessThanOrEqual(1.5);
    });
  }
});

/** StickFigure's hand: a circle this big, with a 1.2 outline. */
const HAND = 2.3 + 0.6;

interface Top {
  /** The y of the top's upper face, and how thick the drawn top is. */
  y: number;
  depth: number;
}

function woodTop(body: string, match: (rect: Attrs) => boolean): Top {
  const rects = tags(body, "rect").filter(match);
  const top = rects.reduce((best, rect) =>
    num(rect, "y") < num(best, "y") ? rect : best,
  );
  return { y: num(top, "y"), depth: num(top, "height") };
}

/** What a seated figure's resting hands lie on in each set, as the stage draws it, and which rest the stage gives them. */
function seatedAt(
  setting: StageSetting,
): Array<{ what: string; top: Top; rest: "table" | "desk" }> {
  const place = PLACES[setting];
  const found: Array<{ what: string; top: Top; rest: "table" | "desk" }> = [];
  if (place.desk) {
    const body = render(StudioDesk, {
      props: {
        height: 480,
        layer: "front",
        seats: [{ x: 100, facing: 1 }],
        unit: 1,
        width: 960,
      },
    }).body;
    found.push({
      what: "the studio desk",
      top: woodTop(body, (r) => r.fill === "#8a5a3b"),
      rest: "desk",
    });
  }
  for (const piece of place.furniture ?? []) {
    if (piece.kind === "chair" && !piece.desk) continue;
    const body = render(StickFurniture, { props: { piece } }).body;
    const top = woodTop(
      body,
      (r) => r.class === "fill-scene-wood" && num(r, "width") > 20,
    );
    found.push({
      what: piece.kind === "chair" ? "a school desk" : "the table",
      top,
      rest: "table",
    });
  }
  for (const piece of place.set?.pieces ?? []) {
    if (piece.kind !== "table") continue;
    const body = render(StickSet, {
      props: {
        geometry: { pieces: [piece], pieceX: () => 0 },
        layer: piece.front ? "front" : "behind",
        view: { x: 0, y: 0, width: 960, height: 480 },
        world: startWorld([]),
      },
    }).body;
    const top = woodTop(body, (r) => r.class === "fill-scene-wood");
    expect(top.y).toBe(pieceTop(piece));
    found.push({ what: `the ${piece.id}`, top, rest: "table" });
  }
  return found;
}

describe("resting hands at each set's table", () => {
  for (const setting of Object.keys(PLACES) as StageSetting[]) {
    for (const { what, top, rest } of seatedAt(setting)) {
      it(`lays seated hands on ${what} in ${setting}`, () => {
        const rig = solveRig(restOnTable(REST_POSE, 1, rest), 1);
        for (const hand of [rig.leadArm.end, rig.rearArm.end]) {
          const bottom = hand.y + HAND;
          // On it: the hand's underside on the top, or into its thickness, where the top's edge hides it.
          expect(
            bottom,
            `hand ${(top.y - bottom).toFixed(1)} over ${what}`,
          ).toBeGreaterThanOrEqual(top.y);
          expect(bottom, `hand through ${what}`).toBeLessThanOrEqual(top.y + top.depth);
        }
      });
    }
  }
});
