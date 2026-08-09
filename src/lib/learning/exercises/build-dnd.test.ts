import { describe, expect, it } from "vitest";

import {
  canInsertBankIndex,
  computeTrayInsertIndex,
  insertBankIndexAt,
  parseBuildDragPayload,
  reorderBuiltIndexes,
  serializeBuildDragPayload,
} from "./build-dnd";

describe("build-dnd", () => {
  it("round-trips drag payloads", () => {
    const bank = serializeBuildDragPayload({ kind: "bank", index: 2 });
    expect(parseBuildDragPayload(bank)).toEqual({ kind: "bank", index: 2 });

    const tray = serializeBuildDragPayload({ kind: "tray", index: 1 });
    expect(parseBuildDragPayload(tray)).toEqual({ kind: "tray", index: 1 });
  });

  it("rejects invalid payloads", () => {
    expect(parseBuildDragPayload("")).toBeNull();
    expect(parseBuildDragPayload("{}")).toBeNull();
    expect(parseBuildDragPayload('{"kind":"bank","index":-1}')).toBeNull();
  });

  it("inserts a bank index at a position", () => {
    expect(insertBankIndexAt([2, 1], 3, 1)).toEqual([2, 3, 1]);
    expect(insertBankIndexAt([2, 1], 0, 2)).toEqual([2, 1, 0]);
  });

  it("reorders tray indexes", () => {
    expect(reorderBuiltIndexes([2, 1, 3, 0], 1, 3)).toEqual([2, 3, 1, 0]);
    expect(reorderBuiltIndexes([2, 1, 3, 0], 3, 1)).toEqual([2, 0, 1, 3]);
    expect(reorderBuiltIndexes([2, 1], 1, 1)).toEqual([2, 1]);
  });

  it("guards bank insert capacity and duplicate indexes", () => {
    expect(canInsertBankIndex([2, 1], 3, 4)).toBe(true);
    expect(canInsertBankIndex([2, 1, 3, 0], 5, 4)).toBe(false);
    expect(canInsertBankIndex([2, 1], 2, 4)).toBe(false);
  });

  it("computes tray insert index from chip midpoints", () => {
    const midpoints = [50, 120, 190];
    expect(computeTrayInsertIndex(30, midpoints)).toBe(0);
    expect(computeTrayInsertIndex(80, midpoints)).toBe(1);
    expect(computeTrayInsertIndex(150, midpoints)).toBe(2);
    expect(computeTrayInsertIndex(220, midpoints)).toBe(3);
    expect(computeTrayInsertIndex(10, [])).toBe(0);
  });
});
