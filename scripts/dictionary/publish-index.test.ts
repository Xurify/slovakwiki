import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DICTIONARY_INDEX_CACHE_CONTROL,
  dictionaryIndexFileName,
  publishDictionaryIndex,
  servedIndexProblem,
} from "./publish-index";

const SITE = "https://www.slovak.wiki";
const BASE = "https://audio.slovak.wiki";
const CREDS = {
  R2_ACCOUNT_ID: "acct",
  R2_ACCESS_KEY_ID: "key",
  R2_SECRET_ACCESS_KEY: "secret",
  R2_BUCKET: "bucket",
};

function served(headers: Record<string, string>, status = 200): Response {
  return new Response(null, { headers, status });
}

const usable = { "access-control-allow-origin": SITE, "content-encoding": "br" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("dictionaryIndexFileName", () => {
  it("changes with the content", () => {
    const a = dictionaryIndexFileName('[{"slug":"byt"}]');
    expect(a).toMatch(/^dictionary-browse\.[0-9a-f]{12}\.json$/);
    expect(dictionaryIndexFileName('[{"slug":"byt"}]')).toBe(a);
    expect(dictionaryIndexFileName('[{"slug":"mat"}]')).not.toBe(a);
  });
});

describe("servedIndexProblem", () => {
  it("accepts a compressed response the site may read", () => {
    expect(servedIndexProblem(served(usable), SITE)).toBeUndefined();
    expect(
      servedIndexProblem(
        served({ "access-control-allow-origin": "*", "content-encoding": "gzip" }),
        SITE,
      ),
    ).toBeUndefined();
  });

  it("rejects missing CORS, missing compression and errors", () => {
    expect(servedIndexProblem(served({ "content-encoding": "br" }), SITE)).toMatch(
      /CORS/,
    );
    expect(
      servedIndexProblem(served({ "access-control-allow-origin": SITE }), SITE),
    ).toMatch(/uncompressed/);
    expect(servedIndexProblem(served({}, 404), SITE)).toBe("HTTP 404");
  });
});

describe("publishDictionaryIndex", () => {
  const options = {
    fileName: "dictionary-browse.abc.json",
    json: "[]",
    siteOrigin: SITE,
  };

  it("does nothing without PUBLIC_DATA_BASE_URL", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const warn = vi.fn();

    expect(
      await publishDictionaryIndex({ ...options, env: CREDS, warn }),
    ).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("uploads a missing index with immutable caching, then uses R2", async () => {
    const requests: Request[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const request = new Request(input, init);
        requests.push(request);
        if (request.url.includes("r2.cloudflarestorage.com")) {
          return new Response(null, { status: request.method === "HEAD" ? 404 : 200 });
        }
        return served(usable);
      }),
    );

    const url = await publishDictionaryIndex({
      ...options,
      env: { ...CREDS, PUBLIC_DATA_BASE_URL: `${BASE}/` },
      warn: vi.fn(),
    });

    expect(url).toBe(`${BASE}/data/dictionary-browse.abc.json`);
    const put = requests.find((request) => request.method === "PUT");
    expect(put?.url).toBe(
      "https://acct.r2.cloudflarestorage.com/bucket/data/dictionary-browse.abc.json",
    );
    expect(put?.headers.get("cache-control")).toBe(DICTIONARY_INDEX_CACHE_CONTROL);
  });

  it("falls back to the site copy when the bucket lacks CORS", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => served({ "content-encoding": "br" })),
    );
    const warn = vi.fn();

    const url = await publishDictionaryIndex({
      ...options,
      env: { ...CREDS, PUBLIC_DATA_BASE_URL: BASE },
      warn,
    });

    expect(url).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/CORS rule/));
  });

  it("uses an index already on R2 without credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => served(usable)),
    );

    expect(
      await publishDictionaryIndex({
        ...options,
        env: { PUBLIC_DATA_BASE_URL: BASE },
        warn: vi.fn(),
      }),
    ).toBe(`${BASE}/data/dictionary-browse.abc.json`);
  });

  it("never throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    const warn = vi.fn();

    expect(
      await publishDictionaryIndex({
        ...options,
        env: { ...CREDS, PUBLIC_DATA_BASE_URL: BASE },
        warn,
      }),
    ).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/fetch failed/));
  });
});
