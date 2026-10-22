import { describe, expect, it } from "vitest";

import { parseListObjectsPage, planPrune } from "./orphans";

const now = Date.parse("2026-10-22T20:00:00.000Z");
const twoDaysAgo = "2026-10-20T19:25:24.933Z";
const august = "2026-08-01T10:00:00.000Z";

const live = "lesson/004d174dd52b3e298542.mp3";
const branchWord = "audio/lemma/7c1d2e3f405162738495.mp3";
const oldTake = "audio/lesson/1a2b3c4d5e6f70819203.mp3";

describe("planPrune", () => {
  it("keeps R2 orphans uploaded in the last keepDays and deletes older ones", () => {
    const plan = planPrune({
      expected: new Set([live]),
      keepDays: 30,
      now,
      onDisk: [],
      onR2: [
        { key: branchWord, lastModified: twoDaysAgo },
        { key: oldTake, lastModified: august },
      ],
    });

    expect(plan.r2).toEqual([oldTake]);
    expect(plan.recentOnR2).toEqual([branchWord]);
  });

  it("deletes recent uploads too with keepDays 0", () => {
    const plan = planPrune({
      expected: new Set([live]),
      keepDays: 0,
      now,
      onDisk: [],
      onR2: [
        { key: branchWord, lastModified: twoDaysAgo },
        { key: oldTake, lastModified: undefined },
      ],
    });

    expect(plan.r2).toEqual([branchWord, oldTake]);
    expect(plan.recentOnR2).toEqual([]);
  });

  it("keeps an R2 orphan whose upload time it cannot read", () => {
    const plan = planPrune({
      expected: new Set([live]),
      keepDays: 30,
      now,
      onDisk: [],
      onR2: [
        { key: oldTake, lastModified: undefined },
        { key: branchWord, lastModified: "yesterday" },
      ],
    });

    expect(plan.r2).toEqual([]);
    expect(plan.recentOnR2).toEqual([oldTake, branchWord]);
  });

  it("never deletes a clip this branch plays, under either R2 prefix", () => {
    const plan = planPrune({
      expected: new Set([live]),
      keepDays: 30,
      now,
      onDisk: [live],
      onR2: [
        { key: `audio/${live}`, lastModified: august },
        { key: live, lastModified: august },
      ],
    });

    expect(plan).toEqual({ local: [], r2: [], recentOnR2: [] });
  });

  it("lists every local orphan, whatever R2 keeps", () => {
    const localTake = oldTake.replace(/^audio\//, "");
    const plan = planPrune({
      expected: new Set([live]),
      keepDays: 30,
      now,
      onDisk: [live, localTake],
      onR2: [{ key: oldTake, lastModified: twoDaysAgo }],
    });

    expect(plan.local).toEqual([localTake]);
    expect(plan.recentOnR2).toEqual([oldTake]);
  });
});

describe("parseListObjectsPage", () => {
  it("reads each key with its upload time and the token for the next page", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <Name>slovakwiki</Name>
  <Contents>
    <Key>${branchWord}</Key>
    <Size>17598</Size>
    <LastModified>${twoDaysAgo}</LastModified>
    <ETag>&quot;9b2cf535f27731c974343645a3985328&quot;</ETag>
    <StorageClass>STANDARD</StorageClass>
  </Contents>
  <Contents>
    <Key>${oldTake}</Key>
    <Size>23031</Size>
    <LastModified>${august}</LastModified>
    <ETag>&quot;6f5902ac237024bdd0c176cb93063dc4&quot;</ETag>
    <StorageClass>STANDARD</StorageClass>
  </Contents>
  <IsTruncated>true</IsTruncated>
  <NextContinuationToken>MWEyYjNjNGQ=</NextContinuationToken>
  <KeyCount>2</KeyCount>
  <MaxKeys>1000</MaxKeys>
  <Prefix>audio/</Prefix>
</ListBucketResult>`;

    expect(parseListObjectsPage(xml)).toEqual({
      nextToken: "MWEyYjNjNGQ=",
      objects: [
        { key: branchWord, lastModified: twoDaysAgo },
        { key: oldTake, lastModified: august },
      ],
    });
  });

  it("ends the listing on a page that is not truncated", () => {
    const xml =
      '<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">' +
      `<Contents><Key>${oldTake}</Key><LastModified>${august}</LastModified></Contents>` +
      "<IsTruncated>false</IsTruncated></ListBucketResult>";

    expect(parseListObjectsPage(xml)).toEqual({
      nextToken: "",
      objects: [{ key: oldTake, lastModified: august }],
    });
  });
});
