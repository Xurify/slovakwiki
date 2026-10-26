import { describe, expect, it } from "vitest";

import { externalLookupsForLemma } from "./external-lookups";

describe("externalLookupsForLemma", () => {
  it("returns an empty list for blank input", () => {
    expect(externalLookupsForLemma("")).toEqual([]);
    expect(externalLookupsForLemma("   ")).toEqual([]);
  });

  it("builds encoded lemma URLs with local brand icons", () => {
    const links = externalLookupsForLemma("priznávať");
    const byId = Object.fromEntries(links.map((link) => [link.id, link]));

    expect(links.map((link) => link.id)).toEqual([
      "deepl",
      "google-translate",
      "tatoeba",
      "linguee",
      "reverso",
      "wiktionary",
      "juls",
      "sme-slovnik",
      "synonyma",
      "zoznam",
      "slovnik-iz",
      "google-images",
    ]);

    const q = encodeURIComponent("priznávať");
    expect(byId.deepl?.href).toBe(`https://www.deepl.com/translator#sk/en/${q}`);
    expect(byId.deepl?.icon).toBe("/icons/lookups/deepl.png");
    expect(byId["google-translate"]?.href).toBe(
      `https://translate.google.com/?sl=sk&tl=en&text=${q}&op=translate`,
    );
    expect(byId.tatoeba?.href).toBe(
      `https://tatoeba.org/en/sentences/search?from=slk&to=eng&query=${q}`,
    );
    expect(byId.linguee?.href).toBe(
      `https://www.linguee.com/slovak-english/search?source=auto&query=${q}`,
    );
    expect(byId.linguee?.icon).toBe("/icons/lookups/linguee.jpg");
    expect(byId.reverso?.href).toBe(
      `https://context.reverso.net/translation/slovak-english/${q}`,
    );
    expect(byId.wiktionary?.href).toBe(`https://en.wiktionary.org/wiki/${q}`);
    expect(byId.wiktionary?.icon).toBe("/icons/lookups/wiktionary.jpg");
    expect(byId.juls?.href).toBe(`https://slovnik.juls.savba.sk/?w=${q}`);
    expect(byId["sme-slovnik"]?.href).toBe(`https://slovnik.sme.sk/slovo/${q}`);
    expect(byId.synonyma?.href).toBe(`https://slovnik.aktuality.sk/synonyma/?q=${q}`);
    expect(byId.zoznam?.href).toBe(
      `https://webslovnik.zoznam.sk/slovensko-anglicky/?s=${q}`,
    );
    expect(byId.zoznam?.icon).toBe("/icons/lookups/zoznam.png");
    expect(byId["google-images"]?.href).toBe(
      `https://www.google.com/search?tbm=isch&q=${q}`,
    );

    expect(byId["slovnik-iz"]?.href).toBe(`https://slovnik.iz.sk/?word=${q}`);
    expect(byId.verbix).toBeUndefined();

    for (const link of links) {
      expect(link.icon.startsWith("/icons/lookups/")).toBe(true);
    }
  });

  it("adds Nárečie.sk only when the lemma is tagged dialect", () => {
    const plain = externalLookupsForLemma("dačo");
    expect(plain.map((link) => link.id)).not.toContain("narecie");

    const links = externalLookupsForLemma("dačo", { dialect: true });
    const narecie = links.find((link) => link.id === "narecie");
    const q = encodeURIComponent("dačo");

    expect(links.map((link) => link.id)).toContain("narecie");
    expect(narecie?.href).toBe(`https://narecie.sk/${q}+`);
    expect(narecie?.icon).toBe("/icons/lookups/narecie.png");
    expect(links.at(-1)?.id).toBe("google-images");
  });

  it("links Verbix forms for verbs, nouns and adjectives only", () => {
    const verbix = (lemma: string, category: string) =>
      externalLookupsForLemma(lemma, { category }).find((link) => link.id === "verbix");

    expect(verbix("čakať", "Verbs")?.href).toBe(
      `https://www.verbix.com/slovak/verb/${encodeURIComponent("čakať")}`,
    );
    expect(verbix("dom", "Nouns")?.href).toBe("https://www.verbix.com/slovak/noun/dom");
    expect(verbix("dobrý", "Adjectives")?.href).toBe(
      `https://www.verbix.com/slovak/adjective/${encodeURIComponent("dobrý")}`,
    );
    expect(verbix("rýchlo", "Adverbs")).toBeUndefined();
  });
});
