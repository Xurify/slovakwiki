import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { readJsonFile, writeFileAtomic } from "./json-file";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "json-file-"));
});

afterEach(async () => {
  await rm(dir, { force: true, recursive: true });
});

describe("readJsonFile", () => {
  it("returns the fallback when the file does not exist", async () => {
    expect(await readJsonFile(path.join(dir, "missing.json"), {})).toEqual({});
  });

  it("parses an existing file", async () => {
    const file = path.join(dir, "manifest.json");
    await writeFile(file, '{"a":{"kind":"lemma"}}\n');
    expect(await readJsonFile(file, {})).toEqual({ a: { kind: "lemma" } });
  });

  it("throws on a truncated file instead of returning the fallback", async () => {
    const file = path.join(dir, "manifest.json");
    await writeFile(file, '{"a":{"kind":"lem');
    await expect(readJsonFile(file, {})).rejects.toThrow(/not valid JSON/);
  });
});

describe("writeFileAtomic", () => {
  it("replaces the file and leaves no temp file behind", async () => {
    const file = path.join(dir, "manifest.json");
    await writeFile(file, "old\n");
    await writeFileAtomic(file, "new\n");

    expect(await readFile(file, "utf8")).toBe("new\n");
    expect(await readdir(dir)).toEqual(["manifest.json"]);
  });
});
