import { describe, expect, it } from "vitest";

import { motionFor, sampleMotion, type Surroundings } from "./act-motions";
import { setUp, startWorld } from "./acts";
import { PLACES } from "./places";
import { REST_POSE } from "./pose";
import { GROUND_Y, STICK_BOX, solveRig, type Point } from "./rig";
import { BESIDE_GAP } from "./stage-frame";

const HOME = PLACES.home.set!;

/** A dog standing `ahead` rig units in front of whoever moves, its collar and the top of its head where StickDog draws them. */
function besideDog(ahead: number, squats = false): Surroundings {
  return {
    pointOf: (name, as = "grip") =>
      name === "bobik" || name === "dog"
        ? as === "top"
          ? { x: ahead - 15, y: 87.8 }
          : { x: ahead - 12.8, y: 102 }
        : undefined,
    meetWith: () => undefined,
    squats,
  };
}

const gap = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

describe("getting down to a dog", () => {
  const withLead = setUp(startWorld(HOME.objects), {
    objects: [
      { id: "lead", kind: "lead", start: { where: { hand: "robo", side: "lead" } } },
    ],
  });

  it("clips the lead on from a crouch, knees bent and back nearly upright, for a robot as for a person", () => {
    for (const [who, squats] of [
      ["robo", true],
      ["marek", false],
    ] as const) {
      const world = setUp(withLead, {
        objects: [
          { id: "lead", kind: "lead", start: { where: { hand: who, side: "lead" } } },
        ],
      });
      const { motion } = motionFor(
        { do: "leash", what: "lead", to: "bobik" },
        who,
        world,
      );
      // Where a walk over to the dog stops (BESIDE_GAP), the dog turned to them.
      const around = besideDog(BESIDE_GAP * STICK_BOX.width, squats);
      const rig = solveRig(sampleMotion(motion, 700, REST_POSE, around, 0).pose, 0);
      expect(rig.lean).toBeLessThan(25);
      expect(gap(rig.leadArm.end, around.pointOf("bobik")!)).toBeLessThan(3);
      // Too far off to reach, the hips still stay over the floor: they went below the feet, and the body fell forward stiff.
      const far = solveRig(
        sampleMotion(motion, 700, REST_POSE, besideDog(80, squats), 0).pose,
        0,
      );
      expect(far.hip.y).toBeLessThanOrEqual(GROUND_Y - 8);
    }
  });
});

describe("a dog giving what it carries", () => {
  const world = setUp(startWorld(HOME.objects), {
    objects: [
      { id: "ball", kind: "ball", start: { where: { hand: "dog", side: "lead" } } },
    ],
  });

  it("lifts it to the one it brings it to, who comes down to take it from its mouth", () => {
    const { motion, partner } = motionFor(
      { do: "give", what: "ball", to: "robot" },
      "dog",
      world,
    );
    expect(motion.face).toBe("robot");
    expect(partner?.who).toBe("robot");
    expect(partner?.motion.face).toBe("dog");
    const around = besideDog(45, true);
    const mouth = { x: 45 - 15 - 12, y: 87.8 + 11 };
    const taking = sampleMotion(
      partner!.motion,
      partner!.motion.takes!,
      REST_POSE,
      around,
      0,
    );
    const rig = solveRig(taking.pose, 0);
    expect(gap(rig.leadArm.end, mouth)).toBeLessThan(3);
    expect(rig.hip.y).toBeLessThan(GROUND_Y - 10);
    // The dog's head comes up to the hand, not down.
    expect(
      sampleMotion(motion, motion.takes!, REST_POSE, around, 0).pose.tilt,
    ).toBeLessThan(0);
  });
});

describe("pointing up at something nearly overhead", () => {
  it("puts the arm out to that side, not straight up beside the head", () => {
    const world = startWorld(HOME.objects);
    const { motion } = motionFor({ do: "point", to: "zena" }, "marek", world);
    for (const x of [-4, 0, 4]) {
      const around: Surroundings = {
        pointOf: (name) => (name === "zena" ? { x, y: 20 } : undefined),
        meetWith: () => undefined,
      };
      const rig = solveRig(sampleMotion(motion, 1000, REST_POSE, around, 0).pose, 0);
      const hand = rig.leadArm.end;
      const shoulder = rig.leadShoulder;
      const slope = (shoulder.y - hand.y) / Math.abs(hand.x - shoulder.x);
      expect(slope).toBeLessThan(1.6);
      expect(Math.sign(hand.x - shoulder.x)).toBe(x < shoulder.x ? -1 : 1);
    }
  });
});

describe("a deep crouch", () => {
  it("rests the knees on the floor, never under it", () => {
    for (let bob = 0; bob <= 30; bob += 2) {
      const rig = solveRig({ ...REST_POSE, bob, lean: 10 }, 0);
      expect(rig.leadLeg.joint.y).toBeLessThan(GROUND_Y);
      expect(rig.rearLeg.joint.y).toBeLessThan(GROUND_Y);
    }
  });
});
