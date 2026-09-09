import { describe, expect, it } from "vitest";

import { imageAuditSource } from "./image-audit";

describe("imageAuditSource", () => {
  it("labels Wikipedia pageimages vs Commons", () => {
    expect(
      imageAuditSource({
        fetchedAt: "2026-01-01T00:00:00.000Z",
        status: "ok",
        wikiLang: "sk",
        wikiTitle: "chyba",
      }),
    ).toBe("sk-wiki");
    expect(
      imageAuditSource({
        fetchedAt: "2026-01-01T00:00:00.000Z",
        status: "ok",
        wikiLang: "en",
        wikiTitle: "Mistake",
      }),
    ).toBe("en-wiki");
    expect(
      imageAuditSource({
        fetchedAt: "2026-01-01T00:00:00.000Z",
        status: "ok",
        wikiTitle: "Commons:lunch meal (audited)",
      }),
    ).toBe("commons");
  });
});
