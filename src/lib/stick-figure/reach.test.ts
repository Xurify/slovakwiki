import { describe, expect, it } from "vitest";

import { REST_POSE } from "./pose";
import { restOnTable } from "./reach";
import { solveRig } from "./rig";

describe("hands at the table", () => {
  it("lays resting hands on the top in front, not down through it", () => {
    const rig = solveRig(restOnTable(REST_POSE, 1), 1);
    for (const [arm, shoulder] of [
      [rig.leadArm, rig.leadShoulder],
      [rig.rearArm, rig.rearShoulder],
    ] as const) {
      expect(arm.end.x - shoulder.x).toBeGreaterThan(5);
      expect(arm.end.y - shoulder.y).toBeCloseTo(arm === rig.leadArm ? 9 : 9.5, 0);
    }
  });

  it("lets a beat and a raised arm leave the table", () => {
    const beat = { ...REST_POSE, leadRaise: REST_POSE.leadRaise + 12 };
    expect(restOnTable(beat, 1).leadRaise).toBe(beat.leadRaise);
    const folded = { ...REST_POSE, rearBend: -90 };
    expect(restOnTable(folded, 1).rearBend).toBe(-90);
  });

  it("leaves a standing figure's arms alone", () => {
    expect(restOnTable(REST_POSE, 0)).toEqual(REST_POSE);
  });
});
