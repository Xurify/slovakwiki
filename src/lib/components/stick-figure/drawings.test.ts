import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

import { LESSON_CHARACTER_IDS } from "$lib/catalog/lessons/character-ids";
import { STICK_PICTURE_IDS } from "$lib/stick-figure/pictures";
import { STICK_PROP_IDS } from "$lib/stick-figure/props";
import StickFigure from "./StickFigure.svelte";
import StickPicture from "./StickPicture.svelte";
import StickProp from "./StickProp.svelte";

/** How many shapes a drawing has; an id the component has no branch for draws none. */
function shapes(body: string): number {
  return body.match(/<(path|circle|ellipse|rect|polygon)\b/g)?.length ?? 0;
}

describe("drawings", () => {
  it("draws every prop, each its own way", () => {
    const bodies = STICK_PROP_IDS.filter((prop) => prop !== "umbrella").map(
      (prop) => render(StickProp, { props: { prop } }).body,
    );

    for (const body of bodies) expect(shapes(body)).toBeGreaterThan(0);
    expect(new Set(bodies).size).toBe(bodies.length);
  });

  it("draws every picture, each its own way", () => {
    const bodies = STICK_PICTURE_IDS.map(
      (picture) => render(StickPicture, { props: { picture } }).body,
    );

    for (const body of bodies) expect(shapes(body)).toBeGreaterThan(0);
    expect(new Set(bodies).size).toBe(bodies.length);
  });

  it("puts every prop in a figure's hand, and an umbrella open or folded", () => {
    const empty = shapes(render(StickFigure, { props: { characterId: "alex" } }).body);
    const holding = (held: { id: (typeof STICK_PROP_IDS)[number]; open?: boolean }) =>
      render(StickFigure, { props: { characterId: "alex", held } }).body;

    for (const id of STICK_PROP_IDS) {
      expect(shapes(holding({ id }))).toBeGreaterThan(empty);
    }
    expect(holding({ id: "umbrella", open: true })).not.toBe(
      holding({ id: "umbrella", open: false }),
    );
  });

  it("draws every character as themselves", () => {
    const bodies = LESSON_CHARACTER_IDS.map(
      (characterId) => render(StickFigure, { props: { characterId } }).body,
    );

    expect(new Set(bodies).size).toBe(bodies.length);
  });
});
