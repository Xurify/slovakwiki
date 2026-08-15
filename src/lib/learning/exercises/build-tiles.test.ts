import { describe, expect, it } from "vitest";

import {
  canCheckBuild,
  gradeBuild,
  isBankTileUsed,
  resolveBuiltTiles,
} from "./build-tiles";

/** Repro: phone digits 0905 — bank has duplicate nula / deväť. */
const PHONE_BANK = ["päť.", "deväť", "nula", "nula", "deväť", "nula"] as const;
const PHONE_ANSWER = ["nula", "deväť", "nula", "päť."] as const;

describe("build tiles", () => {
  it("keeps unused duplicate labels available after picking one", () => {
    // User picked bank[2]=nula, bank[1]=deväť → remaining nula at 3 and 5 stay free
    const used = [2, 1];

    expect(isBankTileUsed(used, 2)).toBe(true);
    expect(isBankTileUsed(used, 1)).toBe(true);
    expect(isBankTileUsed(used, 3)).toBe(false);
    expect(isBankTileUsed(used, 5)).toBe(false);
    expect(isBankTileUsed(used, 0)).toBe(false);
  });

  it("builds 0905 from bank indexes without consuming every duplicate", () => {
    // nula(2) deväť(1) nula(3) päť.(0) — leaves distractor nula(5) and deväť(4)
    const indexes = [2, 1, 3, 0];
    const built = resolveBuiltTiles(PHONE_BANK, indexes);

    expect(built).toEqual([...PHONE_ANSWER]);
    expect(gradeBuild(built, PHONE_ANSWER)).toBe(true);
    expect(canCheckBuild(built.length, PHONE_ANSWER.length)).toBe(true);
    expect(isBankTileUsed(indexes, 5)).toBe(false);
    expect(isBankTileUsed(indexes, 4)).toBe(false);
  });

  it("does not require using distractor tiles to check", () => {
    expect(canCheckBuild(4, 4)).toBe(true);
    expect(canCheckBuild(6, 4)).toBe(false);
    expect(canCheckBuild(2, 4)).toBe(false);
  });

  it("rejects wrong order even with right multiset", () => {
    const built = resolveBuiltTiles(PHONE_BANK, [2, 3, 1, 0]);
    expect(built).toEqual(["nula", "nula", "deväť", "päť."]);
    expect(gradeBuild(built, PHONE_ANSWER)).toBe(false);
  });
});
