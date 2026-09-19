import { describe, expect, it } from "vitest";

import { practiceSetById } from "$lib/catalog/practice";

import { practiceSetEarlyReadyScript } from "./fouc";
import {
  clientPracticeSession,
  mergePracticeSession,
  ssrPracticeSession,
} from "./session";

function requireSet(id: string) {
  const set = practiceSetById.get(id);
  if (!set) throw new Error(`Missing practice set: ${id}`);
  return set;
}

describe("practice session", () => {
  it("SSR session is catalog order and deterministic", () => {
    const set = requireSet("meet-someone");
    const first = ssrPracticeSession(set);
    const second = ssrPracticeSession(set);

    expect(first.map((item) => item.id)).toEqual(set.itemIds);
    expect(second.map((item) => item.id)).toEqual(first.map((item) => item.id));
  });

  it("SSR session slices sessionSize without shuffling", () => {
    const set = requireSet("present-tense-i");
    const items = ssrPracticeSession(set);

    expect(set.sessionSize).toBe(7);
    expect(items.map((item) => item.id)).toEqual(set.itemIds.slice(0, 7));
  });

  it("SSR session is empty for days-dates-time", () => {
    expect(ssrPracticeSession(requireSet("days-dates-and-time"))).toEqual([]);
  });

  it("client default keeps catalog first item and sessionSize", () => {
    const set = requireSet("present-tense-i");
    const session = clientPracticeSession(set, null);

    expect(session[0]?.id).toBe(set.itemIds[0]);
    expect(session).toHaveLength(7);
    expect(new Set(session.map((item) => item.id)).size).toBe(7);
  });

  it("client ?at returns that item", () => {
    const set = requireSet("meet-someone");
    const session = clientPracticeSession(set, "everyday/origin");

    expect(session).toHaveLength(1);
    expect(session[0]?.id).toBe("everyday/origin");
  });

  it("merge keeps the painted first item object", () => {
    const set = requireSet("meet-someone");
    const painted = ssrPracticeSession(set);
    const next = clientPracticeSession(set, null);
    const merged = mergePracticeSession(painted, next);

    expect(merged[0]).toBe(painted[0]);
    expect(merged.map((item) => item.id)[0]).toBe(set.itemIds[0]);
    expect(merged).toHaveLength(painted.length);
  });

  it("early ready script skips deferred sets and query paint", () => {
    const ready = practiceSetEarlyReadyScript(false);
    const deferred = practiceSetEarlyReadyScript(true);

    expect(ready).toContain('p.has("at")');
    expect(ready).toContain("data-practice-set-ready");
    expect(ready).toContain("if(false)return");
    expect(deferred).toContain("if(true)return");
  });
});
