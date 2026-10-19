import { describe, expect, it } from "vitest";

import {
  pushRecentQuery,
  readRecentQueries,
  RECENT_QUERIES_LIMIT,
} from "./recent-queries";
import type { StorageLike } from "./search-history";

function memoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

describe("recent queries", () => {
  it("keeps the newest first and dedupes across diacritics", () => {
    const storage = memoryStorage();
    pushRecentQuery(storage, "dakujem", 1);
    pushRecentQuery(storage, "tohto", 2);
    pushRecentQuery(storage, "ďakujem", 3);
    expect(readRecentQueries(storage).map((item) => item.query)).toEqual([
      "ďakujem",
      "tohto",
    ]);
  });

  it("caps the list", () => {
    const storage = memoryStorage();
    for (let index = 0; index < RECENT_QUERIES_LIMIT + 3; index += 1) {
      pushRecentQuery(storage, `q${index}`, index);
    }
    expect(readRecentQueries(storage)).toHaveLength(RECENT_QUERIES_LIMIT);
  });

  it("ignores corrupt storage", () => {
    const storage = memoryStorage();
    storage.setItem("slovak.wiki.recent-queries.v1", "{nope");
    expect(readRecentQueries(storage)).toEqual([]);
  });
});
