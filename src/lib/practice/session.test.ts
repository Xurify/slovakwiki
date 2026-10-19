import { describe, expect, it } from "vitest";

import { practiceSetById } from "$lib/catalog/practice";

import { practiceSetEarlyReadyScript } from "./fouc";
import { REVIEW_SESSION_SIZE } from "./review-memory";
import {
  clientPracticeSession,
  mergePracticeSession,
  reviewPracticeItem,
  reviewPracticeSession,
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

  it("SSR days-dates-time waits for a client-random session", () => {
    expect(ssrPracticeSession(requireSet("days-dates-and-time"))).toEqual([]);
  });

  it("client days-dates-time builds a full session", () => {
    const session = clientPracticeSession(requireSet("days-dates-and-time"), null);

    expect(session).toHaveLength(13);
    expect(new Set(session.map((item) => item.id)).size).toBe(13);
  });

  it("SSR possessives paints a fixed-seed session the client keeps the first card of", () => {
    const set = requireSet("possessives");
    const painted = ssrPracticeSession(set);

    expect(painted).toHaveLength(13);
    expect(ssrPracticeSession(set)).toEqual(painted);

    const merged = mergePracticeSession(painted, clientPracticeSession(set, null));
    expect(merged[0]).toBe(painted[0]);
    expect(new Set(merged.map((item) => item.id)).size).toBe(13);
  });

  it("client possessives ?at draws that kind fresh", () => {
    const session = clientPracticeSession(
      requireSet("possessives"),
      "grammar/possessive-svoj-choice",
    );

    expect(session).toHaveLength(1);
    expect(session[0]?.id).toBe("grammar/possessive-svoj-choice");
  });

  it("SSR demonstratives paints a fixed-seed session the client keeps the first card of", () => {
    const set = requireSet("demonstratives");
    const painted = ssrPracticeSession(set);

    expect(painted).toHaveLength(set.sessionSize!);
    expect(ssrPracticeSession(set)).toEqual(painted);

    const merged = mergePracticeSession(painted, clientPracticeSession(set, null));
    expect(merged[0]).toBe(painted[0]);
    expect(new Set(merged.map((item) => item.id)).size).toBe(set.sessionSize);
  });

  it("client demonstratives ?at draws that kind fresh", () => {
    const session = clientPracticeSession(
      requireSet("demonstratives"),
      "grammar/demonstrative-tym-tymi",
    );

    expect(session).toHaveLength(1);
    expect(session[0]?.id).toBe("grammar/demonstrative-tym-tymi");
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

  it("early ready script hides query paint only", () => {
    const ready = practiceSetEarlyReadyScript();

    expect(ready).toContain('p.has("at")');
    expect(ready).toContain("data-practice-set-ready");
    expect(ready).not.toContain("if(true)return");
  });
});

describe("review session", () => {
  it("draws generated kinds fresh and keeps catalog items", () => {
    const kind = "grammar/demonstrative-agreement";
    const catalogId = requireSet("meet-someone").itemIds[0] ?? "";

    expect(reviewPracticeItem(kind)?.id).toBe(kind);
    expect(reviewPracticeItem(catalogId)?.id).toBe(catalogId);
  });

  it("skips items that left the catalog and caps the session", () => {
    const ids = requireSet("present-tense-i").itemIds;
    const session = reviewPracticeSession(["gone/item", ...ids, ...ids]);

    expect(session[0]?.id).toBe(ids[0]);
    expect(session.length).toBe(Math.min(REVIEW_SESSION_SIZE, ids.length * 2));
  });
});
