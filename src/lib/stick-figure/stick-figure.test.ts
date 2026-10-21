import { describe, expect, it } from "vitest";

import { STICK_GESTURE_IDS, gestureDuration, mouthAt, sampleGesture } from "./gestures";
import { foldLine, gestureForLine } from "./line-gesture";
import { estimateSpeechMs, planLine } from "./line-plan";
import {
  MOUTH_FRAME_MS,
  MOUTH_LEAD_MS,
  decodeMouthTrack,
  encodeMouthTrack,
  mouthFromTrack,
  trackPauses,
  trackSpeechSpan,
} from "./mouth-track";
import { performFrame, startPerformance, type PerformanceInput } from "./performance";
import { REST_POSE } from "./pose";
import { GROUND_Y, solveRig, type Point } from "./rig";
import { slovakSyllables } from "./syllables";

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

describe("slovakSyllables", () => {
  it.each([
    ["Dobrý", 2],
    ["deň", 1],
    ["piatok", 2],
    ["ľudia", 2],
    ["Taliansko", 3],
    ["Mária", 3],
    ["registráciu", 5],
    ["štvrtok", 2],
    ["vlk", 1],
    ["krk", 1],
    ["slnko", 2],
    ["jablko", 3],
    ["auto", 2],
    ["Európa", 3],
    ["naučiť", 3],
    ["krásnou", 2],
    ["chlieb", 1],
    ["môj", 1],
    ["v", 0],
  ] as const)("%s has %i", (word, count) => {
    expect(slovakSyllables(word)).toHaveLength(count);
  });

  it("marks diphthongs and long vowels long, hiatus after a long vowel short", () => {
    expect(slovakSyllables("piatok").map((syllable) => syllable.long)).toEqual([
      true,
      false,
    ]);
    expect(slovakSyllables("Mária").map((syllable) => syllable.long)).toEqual([
      true,
      false,
      false,
    ]);
  });

  it("gives onset consonants to their vowel and final ones to the last syllable", () => {
    expect(slovakSyllables("štvrtok")).toEqual([
      { consonants: 3, long: false },
      { consonants: 2, long: false },
    ]);
  });
});

describe("mouth track", () => {
  const rate = 1000;
  const frame = (rate * MOUTH_FRAME_MS) / 1000;

  function tone(frames: number, amplitude: number): number[] {
    return Array.from({ length: frames * frame }, (_, i) =>
      i % 2 ? amplitude : -amplitude,
    );
  }

  it("encodes silence, a quiet hiss under the gate, and a loud burst", () => {
    const samples = [...tone(2, 0), ...tone(2, 20), ...tone(3, 20_000), ...tone(1, 0)];

    expect(encodeMouthTrack(samples, rate)).toBe("00009990");
  });

  it("reads frame centres, a little ahead of the sound", () => {
    const track = decodeMouthTrack("090");
    const centre = 1.5 * MOUTH_FRAME_MS - MOUTH_LEAD_MS;

    expect(mouthFromTrack(track, centre)).toBeCloseTo(1, 5);
    expect(mouthFromTrack(track, centre - MOUTH_FRAME_MS / 2)).toBeCloseTo(0.5, 5);
    expect(mouthFromTrack(track, 10_000)).toBe(0);
  });

  it("finds the voiced span and the pauses inside it", () => {
    const track = decodeMouthTrack("0055000550055000");

    expect(trackSpeechSpan(track)).toEqual({ start: 100, end: 650 });
    expect(trackPauses(track)).toEqual([{ start: 200, end: 350 }]);
  });
});

describe("planLine", () => {
  it("gives every sentence its own gesture and marks questions", () => {
    const plan = planLine("Teší ma. Odkiaľ ste?");

    expect(plan.beats.map((beat) => beat.gesture)).toEqual(["nod", "ask"]);
    expect(plan.questions).toHaveLength(1);
    expect(plan.questions[0].start).toBe(plan.beats[1].at);
  });

  it("gives each gesture time to read before the next", () => {
    const plan = planLine("Dobrý deň. Volám sa Anna.");

    expect(plan.beats.map((beat) => beat.gesture)).toEqual(["wave", "self"]);
    expect(plan.beats[1].at - plan.beats[0].at).toBeGreaterThanOrEqual(700);
  });

  it("adds talking beats through a long sentence", () => {
    const plan = planLine(
      "Moje číslo je nula deväť nula, jeden dva tri, štyri päť šesť.",
    );
    const times = plan.beats.map((beat) => beat.at);

    expect(plan.beats.length).toBeGreaterThan(1);
    expect(plan.beats.every((beat) => beat.gesture === "talk")).toBe(true);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("puts the next sentence on the pause in the clip", () => {
    const track = decodeMouthTrack(
      `0${"8".repeat(8)}${"0".repeat(6)}${"8".repeat(16)}000`,
    );
    const plan = planLine("Áno. Som z Kanady.", track);

    expect(plan.durationMs).toBe(track.length * MOUTH_FRAME_MS);
    expect(plan.beats.map((beat) => beat.gesture)).toEqual(["nod", "self"]);
    expect(plan.beats[0].at).toBe(MOUTH_FRAME_MS);
    expect(plan.beats[1].at).toBe(15 * MOUTH_FRAME_MS);
  });

  it("estimates longer speech for longer text", () => {
    expect(estimateSpeechMs("Dobrý deň, volám sa Anna")).toBeGreaterThan(
      estimateSpeechMs("Dobrý deň"),
    );
  });
});

describe("performFrame", () => {
  const plan = planLine("Dobrý deň. Ako sa máte?");
  const firstAt = plan.beats[0].at;

  function input(overrides: Partial<PerformanceInput>): PerformanceInput {
    return { now: 0, reducedMotion: false, speechMs: 0, talking: true, ...overrides };
  }

  it("waits at rest while the clip loads, without settling", () => {
    const frame = performFrame(plan, startPerformance(), input({ speechMs: null }));

    expect(frame.pose).toEqual(REST_POSE);
    expect(frame.settled).toBe(false);
  });

  it("fires each sentence's gesture when the clip reaches it", () => {
    const first = performFrame(
      plan,
      startPerformance(),
      input({ speechMs: plan.beats[0].at }),
    );
    const second = performFrame(
      plan,
      first.state,
      input({ now: 400, speechMs: plan.beats[1].at }),
    );

    expect(plan.beats.map((beat) => beat.gesture)).toEqual(["wave", "ask"]);
    expect(first.state.beatIndex).toBe(0);
    expect(second.state.beatIndex).toBe(1);
    expect(second.state.beatStartedAt).toBe(400);
  });

  it("cross-fades from the cut-off gesture instead of snapping to rest", () => {
    const first = performFrame(plan, startPerformance(), input({ speechMs: firstAt }));
    const waving = performFrame(
      plan,
      first.state,
      input({ now: 400, speechMs: firstAt }),
    );
    const cut = performFrame(
      plan,
      waving.state,
      input({ now: 400, speechMs: plan.beats[1].at }),
    );

    expect(cut.pose.leadRaise).toBeCloseTo(waving.pose.leadRaise, 5);
  });

  it("raises the brows through a question", () => {
    const [question] = plan.questions;
    const middle = (question.start + question.end) / 2;
    const frame = performFrame(plan, startPerformance(), input({ speechMs: middle }));

    expect(frame.pose.brow).toBeGreaterThanOrEqual(0.8);
  });

  it("opens the mouth from the track only while talking", () => {
    const track = decodeMouthTrack("0999990");
    const tracked = planLine("Ahoj.", track);
    const loud = 3 * MOUTH_FRAME_MS;

    expect(
      performFrame(tracked, startPerformance(), input({ speechMs: loud })).pose.mouth,
    ).toBe(1);
    expect(
      performFrame(tracked, startPerformance(), input({ speechMs: loud, talking: false }))
        .pose.mouth,
    ).toBe(0);
  });

  it("settles once the line ends and the last gesture finishes", () => {
    const playing = performFrame(plan, startPerformance(), input({ speechMs: firstAt }));
    const after = gestureDuration("wave") + 1;

    expect(
      performFrame(plan, playing.state, input({ now: after, talking: false })).settled,
    ).toBe(true);
    expect(
      performFrame(plan, playing.state, input({ now: 100, talking: false })).settled,
    ).toBe(false);
  });

  it("holds one still pose per gesture under reduced motion", () => {
    const start = performFrame(
      plan,
      startPerformance(),
      input({ reducedMotion: true, speechMs: firstAt }),
    );
    const later = performFrame(
      plan,
      start.state,
      input({ now: 700, reducedMotion: true, speechMs: firstAt + 10 }),
    );

    expect(later.pose).toEqual(start.pose);
    expect(start.pose.leadRaise).toBeGreaterThan(90);
  });
});
