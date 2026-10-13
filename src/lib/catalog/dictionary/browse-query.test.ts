import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEV_DICTIONARY_INDEX_PATH,
  DICTIONARY_INDEX_URLS,
  fetchDictionaryIndex,
} from "./browse-query";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchDictionaryIndex", () => {
  it("uses the dev path when no build URLs are defined", () => {
    expect(DICTIONARY_INDEX_URLS).toEqual([DEV_DICTIONARY_INDEX_PATH]);
  });

  it("falls back to the next URL when the first fails", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("https://")) throw new TypeError("CORS");
      return Response.json([{ slug: "byt" }]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const rows = await fetchDictionaryIndex<{ slug: string }>([
      "https://audio.slovak.wiki/data/dictionary-browse.abc.json",
      "/_astro/dictionary-browse.abc.json",
    ]);

    expect(rows).toEqual([{ slug: "byt" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("skips error and malformed responses, then throws the last error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url === "/a" ? new Response(null, { status: 404 }) : Response.json({ rows: [] }),
      ),
    );

    await expect(fetchDictionaryIndex(["/a", "/b"])).rejects.toThrow(/malformed at \/b/);
  });
});
