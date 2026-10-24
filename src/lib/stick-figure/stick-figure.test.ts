import { describe, expect, it } from "vitest";

import {
  STICK_GESTURE_IDS,
  gestureDuration,
  gesturePeak,
  mouthAt,
  sampleGesture,
} from "./gestures";
import { gestureForLine } from "./line-gesture";
import type { StageLine } from "./line-reading";
import { estimateSpeechMs, gesturePlan, planLine, reactionPlan } from "./line-plan";
import { foldLine, wordSentences } from "./slovak-text";
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
import { linePictures } from "./pictures";
import { REST_POSE } from "./pose";
import { GROUND_Y, solveRig, type Point, type StickLimb } from "./rig";
import { aimAt, backdropToStage, figureToStage } from "./backdrop-geometry";
import { PLACES } from "./places";
import { directScene } from "./scene-direction";
import { linePoints } from "./scene-points";
import { stageName } from "./stage-name";
import { gesturesWithProps, heldProps, lineProps, propForSentence } from "./props";
import { restFacing } from "./staging";
import { STEP_MS, stepsFor, walkDuration, walkPose } from "./walk";
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

  it("reads the lip shape of each nucleus", () => {
    const shapes = (word: string) =>
      slovakSyllables(word).map((syllable) => syllable.vowel);

    expect(shapes("Dobrý")).toEqual(["o", "i"]);
    expect(shapes("piatok")).toEqual(["a", "o"]);
    expect(shapes("mäso")).toEqual(["e", "o"]);
    expect(shapes("môj")).toEqual(["o"]);
    expect(shapes("auto")).toEqual(["a", "o"]);
  });

  it("gives onset consonants to their vowel and final ones to the last syllable", () => {
    expect(slovakSyllables("štvrtok")).toEqual([
      { consonants: 3, long: false, vowel: "r" },
      { consonants: 2, long: false, vowel: "o" },
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

  it("lets the author override a sentence's gesture", () => {
    const plan = planLine("Teší ma. Odkiaľ ste?", { gestures: ["wave"] });

    expect(plan.beats.map((beat) => beat.gesture)).toEqual(["wave", "ask"]);
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
    const plan = planLine("Áno. Som z Kanady.", { track });

    expect(plan.durationMs).toBe(track.length * MOUTH_FRAME_MS);
    expect(plan.beats.map((beat) => beat.gesture)).toEqual(["nod", "self"]);
    expect(plan.beats[0].at).toBe(MOUTH_FRAME_MS);
    expect(plan.beats[1].at).toBe(15 * MOUTH_FRAME_MS);
  });

  it("keeps the words after a long pause in their sentence", () => {
    const track = decodeMouthTrack(
      `0${"6".repeat(4)}${"0".repeat(20)}${"8".repeat(30)}000`,
    );
    const plan = planLine("Hm… to je kľúč!", { track });
    const [hum, guess] = plan.sentences;

    expect(hum.end).toBeGreaterThan(hum.start);
    expect(guess.start).toBe(25 * MOUTH_FRAME_MS);
    expect(plan.words?.[0].start).toBe(hum.start);
    expect(plan.words?.[1].start).toBe(guess.start);
    expect(plan.words?.at(-1)?.end).toBeCloseTo(guess.end);
  });

  it("times a word after a pause in the clip text by the pause", () => {
    const track = decodeMouthTrack(
      `0${"8".repeat(14)}${"0".repeat(22)}${"8".repeat(16)}000`,
    );
    const plan = planLine("Dobre, dám si tamten.", {
      said: "Dobre, [pause] dám si tamten.",
      track,
    });

    expect(plan.words?.[1].start).toBeGreaterThan(30 * MOUTH_FRAME_MS);
    expect(planLine("Dobre, dám si tamten.", { track }).words?.[1].start).toBeLessThan(
      25 * MOUTH_FRAME_MS,
    );
  });

  it("records where each sentence is spoken", () => {
    const plan = planLine("Dobrý deň. Volám sa Anna.");

    expect(plan.sentences).toHaveLength(2);
    expect(plan.sentences[0].start).toBe(plan.beats[0].at);
    expect(plan.sentences[1].start).toBeGreaterThan(plan.sentences[0].end);
  });

  it("counts [pause] as silence and a direction like [slowly] as nothing", () => {
    expect(estimateSpeechMs("[slowly] Je to malé.")).toBe(
      estimateSpeechMs("Je to malé."),
    );
    expect(estimateSpeechMs("Je to malé. [pause] Áno.")).toBeGreaterThan(
      estimateSpeechMs("Je to malé. Áno.") + 1000,
    );
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

  it("keeps a listener's mouth shut while their gesture runs on the speaker's clip", () => {
    const listener = reactionPlan(plan, "lean", 200);
    const frame = performFrame(
      listener,
      startPerformance(),
      input({ now: 50, speechMs: 300 }),
    );

    expect(listener.durationMs).toBe(plan.durationMs);
    expect(frame.state.beatIndex).toBe(0);
    expect(frame.pose.mouth).toBe(0);
  });

  it("keeps the mouth shut on a glance at what the speaker points at", () => {
    const frames = [100, 400, 700].map(
      (speechMs) =>
        performFrame(gesturePlan("glance"), startPerformance(), input({ speechMs })).pose
          .mouth,
    );

    expect(frames).toEqual([0, 0, 0]);
  });

  it("eases a pose still in flight back to rest before the first beat", () => {
    const state = startPerformance(1000, { ...REST_POSE, nod: 3 });
    const early = performFrame(plan, state, input({ now: 1040, speechMs: null }));
    const later = performFrame(plan, state, input({ now: 1400, speechMs: null }));

    expect(early.pose.nod).toBeGreaterThan(0);
    expect(early.pose.nod).toBeLessThan(3);
    expect(later.pose.nod).toBe(0);
  });

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
    const tracked = planLine("Ahoj.", { track });
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

describe("stageName", () => {
  it("names the learner's figure on stage", () => {
    expect(stageName("You")).toBe("Alex");
    expect(stageName("Mária")).toBe("Mária");
    expect(stageName("Scene")).toBe("Scene");
  });
});

describe("staging", () => {
  const cast = ["anna", "alex", "waiter"] as const;
  const lines: StageLine[] = [
    { characterId: "anna", slovak: "Pozri, to sú fotky z leta." },
    { characterId: "alex", slovak: "Kto je ten muž?" },
    { characterId: "anna", slovak: "To je môj brat Tom." },
    { characterId: "waiter", slovak: "Dobrý deň. Čo si dáte?" },
    { characterId: "alex", slovak: "Dobre, dám si tento koláč." },
    { characterId: "anna", slovak: "A ja si dám tamtú tortu.", to: "waiter" },
    { characterId: null, slovak: "ĎA-ku-jem" },
  ];
  /** Each line's staging in the café, where the cast stands in the order they first speak. */
  const staged = (scene: readonly StageLine[]) =>
    directScene(scene, "cafe").lines.map(({ staging }) => staging);

  it("faces the middle before anyone speaks", () => {
    expect(restFacing(cast)).toEqual({ anna: 1, alex: 1, waiter: -1 });
  });

  it("turns the speaker to the one spoken to and everyone else to the speaker", () => {
    expect(staged(lines)[0]).toMatchObject({
      addressee: "alex",
      facing: { anna: 1, alex: -1, waiter: -1 },
    });
    expect(staged(lines)[3]).toMatchObject({
      addressee: "anna",
      facing: { anna: 1, alex: 1, waiter: -1 },
    });
  });

  it("follows a line's to over the order of replies", () => {
    expect(staged(lines)[5]).toMatchObject({
      addressee: "waiter",
      facing: { anna: 1, alex: -1, waiter: -1 },
    });
  });

  it("leans in to a question and nods at its answer", () => {
    expect(staged(lines)[3].reactions).toEqual([
      { characterId: "anna", gesture: "lean", sentence: 1, at: 0.5 },
    ]);
    expect(staged(lines)[2].reactions).toEqual([
      { characterId: "alex", gesture: "nod", sentence: 0, at: 1 },
    ]);
    expect(staged(lines)[0].reactions).toEqual([]);
  });

  it("leaves the stage alone for a line nobody on it says", () => {
    expect(staged(lines)[6]).toEqual({
      addressee: null,
      facing: {},
      reactions: [],
    });
  });

  it("walks the one shown something over to the speaker", () => {
    expect(staged(lines)[0].approach).toEqual({
      characterId: "alex",
      toward: -1,
    });
    expect(staged(lines)[1].approach).toBeUndefined();
  });

  it("walks someone called in over to the speaker", () => {
    const visit: StageLine[] = [
      { characterId: "anna", slovak: "Ahoj, poď ďalej!" },
      { characterId: "alex", slovak: "Ahoj!" },
    ];

    expect(staged(visit)[0].approach).toEqual({
      characterId: "alex",
      toward: -1,
    });
  });

  it("walks the waiter off to fetch the order", () => {
    const order: StageLine[] = [
      { characterId: "anna", slovak: "A ja si dám tamtú tortu." },
      { characterId: "waiter", slovak: "Takže tento koláč a tamtú tortu. Hneď to bude." },
    ];

    expect(staged(order)[1].exit).toBe(1);
  });

  it("holds up what the speaker points at in their hands", () => {
    expect(staged(lines)[1]).toMatchObject({
      looksAt: "anna",
      reactions: [{ characterId: "anna", gesture: "show", sentence: 0, at: 0 }],
    });
    expect(staged(lines)[4].looksAt).toBeUndefined();
  });

  it("walks someone on to say hello", () => {
    expect(staged(lines)[2].enter).toEqual({ characterId: "waiter", from: 1 });
    expect(staged(lines).filter(({ enter }) => enter)).toHaveLength(1);
  });

  it("leaves someone answering a hello where they are", () => {
    const meeting: StageLine[] = [
      { characterId: "maria", slovak: "Dobrý deň." },
      { characterId: "alex", slovak: "Dobrý deň." },
    ];

    expect(staged(meeting)[0].enter).toBeUndefined();
  });

  it("turns a goodbye away once it ends", () => {
    const goodbye: StageLine[] = [
      { characterId: "waiter", slovak: "Nech sa páči." },
      { characterId: "alex", slovak: "Ďakujem. Dovidenia!" },
    ];

    expect(staged(goodbye)[1]).toMatchObject({
      facing: { alex: 1, waiter: -1 },
      reactions: [{ characterId: "waiter", gesture: "nod", sentence: 0 }],
      exit: -1,
    });
    expect(staged(goodbye)[0].exit).toBeUndefined();
  });
});

describe("props", () => {
  it("brings out the prop a sentence names", () => {
    expect(propForSentence("Pozri, to sú fotky z leta.")).toBe("camera");
    expect(propForSentence("Čítam knihu. A ty?")).toBe("book");
    expect(propForSentence("Mimochodom, čie sú tie kľúče?")).toBe("keys");
    expect(propForSentence("Dáte si kávu?")).toBe("cup");
    expect(propForSentence("Ale každý týždeň volám svojej mame.")).toBe("phone");
  });

  it("stays empty-handed for words that only look like one", () => {
    expect(propForSentence("Volám sa Anna.")).toBeUndefined();
    expect(propForSentence("Ideme do kaviarne.")).toBeUndefined();
    expect(propForSentence("A vaše telefónne číslo?")).toBeUndefined();
  });

  it("lets the author pick or drop a sentence's prop", () => {
    expect(lineProps("Moje číslo je nula.", ["phone"])).toEqual(["phone"]);
    expect(lineProps("Pozri, to sú fotky z leta.", [null])).toEqual([undefined]);
  });

  it("shows a prop unless the author picked the gesture", () => {
    expect(gesturesWithProps(["camera", undefined])).toEqual(["show", undefined]);
    expect(gesturesWithProps(["camera"], ["point"])).toEqual(["point"]);
  });

  it("keeps a prop in hand until its holder brings out another", () => {
    const held = heldProps([
      { addressee: "alex", characterId: "anna", props: ["camera"] },
      { characterId: "alex", props: [undefined] },
      { addressee: "alex", characterId: "anna", props: ["keys"] },
    ]);

    expect(held).toEqual([{ anna: "camera" }, { anna: "camera" }, { anna: "keys" }]);
  });

  it("puts a prop away when someone else joins in", () => {
    const held = heldProps([
      { addressee: "alex", characterId: "anna", props: ["camera"] },
      { characterId: "alex", props: [undefined] },
      { characterId: "waiter", props: [undefined] },
    ]);

    expect(held).toEqual([{ anna: "camera" }, { anna: "camera" }, {}]);
  });
});

describe("walk", () => {
  it("swings the feet in turn and ends feet together", () => {
    const ms = walkDuration(4);
    const stride = walkPose(REST_POSE, STEP_MS * 1.5, ms);

    expect(Math.abs(stride.stride)).toBeCloseTo(1, 5);
    expect(walkPose(REST_POSE, ms, ms)).toEqual(REST_POSE);
    expect(solveRig(stride).leadLeg.end.x).not.toBeCloseTo(
      solveRig(REST_POSE).leadLeg.end.x,
      1,
    );
  });

  it("keeps a full stride within the leg's reach", () => {
    const rig = solveRig(walkPose(REST_POSE, STEP_MS * 1.5, walkDuration(4)));
    const reach = Math.hypot(
      rig.leadLeg.end.x - rig.hip.x,
      rig.leadLeg.end.y - rig.hip.y,
    );

    expect(reach).toBeLessThanOrEqual(39);
  });

  it("takes steps for the ground it covers", () => {
    expect(stepsFor(0.1)).toBe(2);
    expect(stepsFor(-3.25)).toBe(10);
  });

  it("keeps both feet within reach of the hip at the widest stride", () => {
    const rig = solveRig(walkPose(REST_POSE, STEP_MS / 2, 10 * STEP_MS));
    const shin = (leg: StickLimb) =>
      Math.hypot(leg.end.x - leg.joint.x, leg.end.y - leg.joint.y);

    expect(shin(rig.leadLeg)).toBeCloseTo(19.5, 1);
    expect(shin(rig.rearLeg)).toBeCloseTo(19.5, 1);
  });
});

describe("pictures", () => {
  it("names a country's flag in any case", () => {
    expect(linePictures("Som z Kanady.")).toEqual([{ picture: "flag-ca", word: 2 }]);
    expect(linePictures("Hovoríte po slovensky?")).toEqual([
      { picture: "flag-sk", word: 2 },
    ]);
    expect(linePictures("Dobrý deň.")).toEqual([]);
  });

  it("pops the picture up as its word is said", () => {
    const plan = planLine("Som z Kanady.");
    const cue = plan.pictures?.[0];
    const input = { now: 0, reducedMotion: false, talking: true };
    const before = performFrame(plan, startPerformance(), { ...input, speechMs: 0 });
    const after = performFrame(plan, before.state, {
      ...input,
      now: 500,
      speechMs: (cue?.at ?? 0) + 10,
    });

    expect(cue?.picture).toBe("flag-ca");
    expect(cue?.at).toBeGreaterThan(plan.sentences[0].start);
    expect(before.picture).toBeUndefined();
    expect(after.picture).toBe("flag-ca");
  });

  it("keeps the picture up for a moment after its line, then settles", () => {
    const plan = planLine("Som z Kanady.");
    const said = performFrame(plan, startPerformance(100), {
      now: 100,
      reducedMotion: false,
      speechMs: (plan.pictures?.[0]?.at ?? 0) + 10,
      talking: true,
    });
    const after = (now: number) =>
      performFrame(plan, said.state, {
        now,
        reducedMotion: false,
        speechMs: null,
        talking: false,
      });

    expect(after(1000)).toMatchObject({ picture: "flag-ca", settled: false });
    expect(after(10_000)).toMatchObject({ picture: undefined, settled: true });
  });
});

describe("pointing", () => {
  const cafe = PLACES.cafe.things;

  it("points from the demonstrative at the thing it names", () => {
    expect(linePoints("Koľko stojí tento koláč?", cafe)).toEqual([
      { reach: "near", target: { kind: "thing", id: "kolac" }, word: 2 },
    ]);
    expect(linePoints("A ja si dám tamtú tortu.", cafe)).toEqual([
      { reach: "far", target: { kind: "thing", id: "torta" }, word: 4 },
    ]);
    expect(
      linePoints("Takže tento koláč a tamtú tortu. Hneď to bude.", cafe).map(
        ({ word }) => word,
      ),
    ).toEqual([1, 4]);
  });

  it("points at a thing named without a demonstrative, once while it stays the same", () => {
    expect(linePoints("Koláč je dobrý. Ten koláč si dám.", cafe)).toEqual([
      { reach: undefined, target: { kind: "thing", id: "kolac" }, word: 0 },
    ]);
    expect(linePoints("Koláč je dobrý.", [])).toEqual([]);
  });

  it("points at what is held up, but not on a bare to", () => {
    expect(
      linePoints("Kto je ten muž?", cafe, { holder: "anna", prop: "camera" }),
    ).toEqual([{ reach: undefined, target: { kind: "prop", holder: "anna" }, word: 2 }]);
    expect(linePoints("Kto je ten muž?", cafe)).toEqual([]);
    expect(linePoints("Je to Marek?", cafe, { holder: "anna", prop: "camera" })).toEqual(
      [],
    );
  });

  it("knows which sentence each word is in", () => {
    expect(wordSentences("Áno, to je Marek. Býva v tom dome.")).toEqual([
      0, 0, 0, 0, 1, 1, 1, 1,
    ]);
  });

  it("raises the arm just ahead of its word, over a beat that has not read yet", () => {
    const points = linePoints("Koľko stojí tento koláč?", cafe);
    const plan = planLine("Koľko stojí tento koláč?", { points });

    expect(plan.beats).toHaveLength(1);
    expect(plan.beats[0]).toMatchObject({
      gesture: "point",
      point: { reach: "near", target: { kind: "thing", id: "kolac" } },
    });
    expect(plan.beats[0].at).toBeGreaterThan(plan.sentences[0].start);
  });

  it("turns to what it points at behind it only while the point is in flight", () => {
    const slovak = "Koľko stojí tento koláč?";
    const plan = planLine(slovak, { points: linePoints(slovak, cafe) });
    const behind = {
      ...plan,
      beats: plan.beats.map((beat) =>
        beat.point ? { ...beat, point: { ...beat.point, facing: -1 as const } } : beat,
      ),
    };
    const input = { reducedMotion: false, talking: true };
    const pointing = performFrame(behind, startPerformance(), {
      ...input,
      now: 0,
      speechMs: behind.beats[0].at,
    });
    const done = performFrame(behind, pointing.state, {
      ...input,
      now: gestureDuration("point") + 1,
      speechMs: behind.beats[0].at,
    });

    expect(pointing.started).toBe(behind.beats[0]);
    expect(pointing.facing).toBe(-1);
    expect(done.started).toBeUndefined();
    expect(done.facing).toBeUndefined();
  });

  it("keeps an opening nod when the point comes late enough", () => {
    const slovak = "Dobre, dám si tento koláč.";
    const plan = planLine(slovak, { points: linePoints(slovak, cafe) });

    expect(plan.beats.map((beat) => beat.gesture)).toEqual(["nod", "point"]);
  });

  it("aims the hand where the point goes, reaching for a far one", () => {
    const shoulder = solveRig(REST_POSE).leadShoulder;
    const level = solveRig(gesturePeak("point", { rise: 0 })).leadArm.end;
    const up = solveRig(gesturePeak("point", { rise: 30 })).leadArm.end;
    const near = gesturePeak("point", { reach: "near", rise: 0 });
    const far = gesturePeak("point", { reach: "far", rise: 0 });

    expect(Math.abs(level.y - shoulder.y)).toBeLessThan(1.5);
    expect(up.y).toBeLessThan(level.y - 10);
    expect(solveRig(far).leadArm.end.y).toBeLessThan(solveRig(near).leadArm.end.y);
    expect(far).toMatchObject({ leadBend: 0 });
    expect(far.lean).toBeGreaterThan(near.lean);
    expect(sampleGesture("point", 600, { rise: 0 })).toEqual(
      gesturePeak("point", { rise: 0 }),
    );
  });

  it("points with the rear hand when the lead one is full", () => {
    const pose = gesturePeak("point", { hand: "rear", rise: 0 });
    const rig = solveRig(pose);

    expect(rig.rearArm.end.x).toBeGreaterThan(rig.neck.x + 15);
    expect(Math.abs(rig.rearArm.end.y - rig.rearShoulder.y)).toBeLessThan(2);
    expect(pose.leadRaise).toBe(REST_POSE.leadRaise);
  });

  it("faces the target and keeps the arm in a pointing range", () => {
    expect(aimAt({ x: 100, y: 100 }, { x: 200, y: 100 })).toEqual({ facing: 1, rise: 0 });
    expect(aimAt({ x: 100, y: 100 }, { x: 0, y: 0 })).toEqual({ facing: -1, rise: 40 });
    expect(aimAt({ x: 100, y: 100 }, { x: 110, y: 200 }).rise).toBe(-40);
  });

  it("maps the backdrop onto the stage the way slice draws it", () => {
    expect(backdropToStage({ x: 480, y: 300 }, 1040, 300)).toEqual({ x: 520, y: 300 });
    expect(backdropToStage({ x: 960, y: 0 }, 366, 240, 1)).toEqual({ x: 366, y: 0 });
    expect(backdropToStage({ x: 480, y: 150 }, 366, 240).x).toBeCloseTo(183, 5);
  });

  it("places a rig point on the stage, mirrored for a figure facing left", () => {
    const box = { left: 100, top: 50, width: 80 };

    expect(figureToStage({ x: 0, y: GROUND_Y }, box, 1)).toEqual({ x: 140, y: 158 });
    expect(figureToStage({ x: 10, y: 22 }, box, -1)).toEqual({ x: 130, y: 50 });
  });
});
