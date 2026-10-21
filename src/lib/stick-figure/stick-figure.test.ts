import { describe, expect, it } from "vitest";

import {
  STICK_GESTURE_IDS,
  gestureDuration,
  mouthAt,
  sampleGesture,
  stickFrame,
  stickFrameSettled,
} from "./gestures";
import { foldLine, gestureForLine } from "./line-gesture";
import { REST_POSE } from "./pose";
import { GROUND_Y, solveRig, type Point } from "./rig";

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

describe("solveRig", () => {
  it("plants both feet on the ground at the stance width", () => {
    const rig = solveRig(REST_POSE);

    expect(rig.leadLeg.end).toEqual({ x: REST_POSE.stance, y: GROUND_Y });
    expect(rig.rearLeg.end).toEqual({ x: -REST_POSE.stance, y: GROUND_Y });
  });

  it("keeps thigh and shin length when the hips drop", () => {
    const rig = solveRig({ ...REST_POSE, bob: 4 });

    expect(rig.leadLeg.end.y).toBe(GROUND_Y);
    expect(distance(rig.hip, rig.leadLeg.joint)).toBeCloseTo(19.5, 5);
    expect(distance(rig.leadLeg.joint, rig.leadLeg.end)).toBeCloseTo(19.5, 5);
    expect(rig.leadLeg.joint.x).toBeGreaterThan(REST_POSE.stance);
  });

  it("mirrors the arms at rest", () => {
    const rig = solveRig(REST_POSE);

    expect(rig.leadArm.end.x).toBeCloseTo(-rig.rearArm.end.x, 5);
    expect(rig.leadArm.end.y).toBeCloseTo(rig.rearArm.end.y, 5);
  });

  it("lifts the hand above the shoulder at full raise", () => {
    const rig = solveRig({ ...REST_POSE, leadRaise: 180, leadBend: 0 });

    expect(rig.leadArm.end.y).toBeLessThan(rig.leadShoulder.y - 25);
  });

  it("leans the neck toward the facing side", () => {
    const rig = solveRig({ ...REST_POSE, lean: 10 });

    expect(rig.neck.x).toBeGreaterThan(rig.hip.x);
  });
});

describe("gestures", () => {
  it.each(STICK_GESTURE_IDS)("%s starts and ends at rest", (id) => {
    expect(sampleGesture(id, 0)).toEqual(REST_POSE);
    expect(sampleGesture(id, gestureDuration(id))).toEqual(REST_POSE);
    expect(sampleGesture(id, gestureDuration(id) + 500)).toEqual(REST_POSE);
  });

  it.each(STICK_GESTURE_IDS)("%s moves away from rest midway", (id) => {
    expect(sampleGesture(id, gestureDuration(id) / 2)).not.toEqual(REST_POSE);
  });

  it("keeps the loop running while the clip plays", () => {
    const elapsed = gestureDuration("nod") + 2000;

    expect(stickFrameSettled("nod", { elapsed, talking: true })).toBe(false);
    expect(stickFrameSettled("nod", { elapsed, talking: false })).toBe(true);
  });

  it("opens the mouth only while talking", () => {
    const silent = stickFrame("talk", {
      elapsed: 3000,
      reducedMotion: false,
      talking: false,
    });
    const opened = Array.from({ length: 40 }, (_, step) =>
      stickFrame("talk", {
        elapsed: 3000 + step * 25,
        reducedMotion: false,
        talking: true,
      }),
    ).some((pose) => pose.mouth > 0.3);

    expect(silent.mouth).toBe(0);
    expect(opened).toBe(true);
  });

  it("holds one still pose under reduced motion", () => {
    const early = stickFrame("wave", {
      elapsed: 100,
      reducedMotion: true,
      talking: true,
    });
    const late = stickFrame("wave", { elapsed: 900, reducedMotion: true, talking: true });
    const done = stickFrame("wave", {
      elapsed: 5000,
      reducedMotion: true,
      talking: false,
    });

    expect(early).toEqual(late);
    expect(early.leadRaise).toBeGreaterThan(90);
    expect(done).toEqual(REST_POSE);
  });

  it("keeps the mouth between closed and fully open", () => {
    for (let elapsed = 0; elapsed < 5000; elapsed += 7) {
      const mouth = mouthAt(elapsed);
      expect(mouth).toBeGreaterThanOrEqual(0);
      expect(mouth).toBeLessThanOrEqual(1);
    }
  });
});

describe("gestureForLine", () => {
  it("folds diacritics, case and punctuation", () => {
    expect(foldLine("Ďakujem, pani Ľubica!")).toBe("dakujem pani lubica");
  });

  it.each([
    ["Dobrý deň. Volám sa Anna.", "wave"],
    ["Ahoj!", "wave"],
    ["Dobré ráno.", "wave"],
    ["Teší ma. Odkiaľ ste?", "nod"],
    ["Áno, som.", "nod"],
    ["Ďakujem.", "nod"],
    ["Nie je za čo.", "nod"],
    ["Nie, ďakujem.", "shake"],
    ["Prepáčte, kde je stanica?", "apologize"],
    ["Som z Kanady.", "self"],
    ["Volám sa Alex.", "self"],
    ["Trochu. Ešte sa učím.", "shrug"],
    ["Ja neviem.", "shrug"],
    ["Možno zajtra.", "think"],
    ["Tam je pošta.", "point"],
    ["Výborne!", "cheer"],
    ["Hovoríte po slovensky?", "ask"],
    ["Mám dvadsaťosem rokov.", "talk"],
    ["Dobrý nápad.", "talk"],
  ] as const)("%s → %s", (line, gesture) => {
    expect(gestureForLine(line)).toBe(gesture);
  });
});
