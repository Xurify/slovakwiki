/** Dynamic outbound lookup URLs for a Slovak lemma (Clozemaster-style). */

export type ExternalLookupGroup = "translate" | "dictionary" | "examples" | "images";

export interface ExternalLookupLink {
  group: ExternalLookupGroup;
  href: string;
  icon: string;
  id: string;
  label: string;
}

export interface ExternalLookupOptions {
  dialect?: boolean;
}

/**
 * Build stable search/lookup links for a dictionary lemma.
 * Pass the citation form (e.g. `priznávať`), not a conjugated surface form.
 * Dialect chips are opt-in via `options` — not shown on every lemma.
 */
export function externalLookupsForLemma(
  lemma: string,
  options: ExternalLookupOptions = {},
): ExternalLookupLink[] {
  const trimmed = lemma.trim();
  if (!trimmed) {
    return [];
  }

  const q = encodeURIComponent(trimmed);

  return [
    {
      id: "deepl",
      label: "DeepL",
      group: "translate",
      icon: "/icons/lookups/deepl.png",
      href: `https://www.deepl.com/translator#sk/en/${q}`,
    },
    {
      id: "google-translate",
      label: "Google Translate",
      group: "translate",
      icon: "/icons/lookups/google-translate.png",
      href: `https://translate.google.com/?sl=sk&tl=en&text=${q}&op=translate`,
    },
    {
      id: "tatoeba",
      label: "Tatoeba",
      group: "examples",
      icon: "/icons/lookups/tatoeba.png",
      href: `https://tatoeba.org/en/sentences/search?from=slk&to=eng&query=${q}`,
    },
    {
      id: "linguee",
      label: "Linguee",
      group: "examples",
      icon: "/icons/lookups/linguee.jpg",
      href: `https://www.linguee.com/slovak-english/search?source=auto&query=${q}`,
    },
    {
      id: "reverso",
      label: "Reverso",
      group: "examples",
      icon: "/icons/lookups/reverso.png",
      href: `https://context.reverso.net/translation/slovak-english/${q}`,
    },
    {
      id: "wiktionary",
      label: "Wiktionary",
      group: "dictionary",
      icon: "/icons/lookups/wiktionary.jpg",
      href: `https://en.wiktionary.org/wiki/${q}`,
    },
    {
      id: "juls",
      label: "JÚĽŠ",
      group: "dictionary",
      icon: "/icons/lookups/juls.png",
      href: `https://slovnik.juls.savba.sk/?w=${q}`,
    },
    {
      id: "sme-slovnik",
      label: "SME Slovník",
      group: "dictionary",
      icon: "/icons/lookups/sme-slovnik.png",
      href: `https://slovnik.sme.sk/slovo/${q}`,
    },
    {
      id: "synonyma",
      label: "Synonymá",
      group: "dictionary",
      icon: "/icons/lookups/synonyma.png",
      href: `https://slovnik.aktuality.sk/synonyma/?q=${q}`,
    },
    {
      id: "zoznam",
      label: "WebSlovník",
      group: "dictionary",
      icon: "/icons/lookups/zoznam.png",
      href: `https://webslovnik.zoznam.sk/slovensko-anglicky/?s=${q}`,
    },
    ...(options.dialect
      ? [
          {
            id: "narecie",
            label: "Nárečie.sk",
            group: "dictionary" as const,
            icon: "/icons/lookups/narecie.png",
            href: `https://narecie.sk/${q}+`,
          },
        ]
      : []),
    {
      id: "google-images",
      label: "Google Images",
      group: "images",
      icon: "/icons/lookups/google-images.png",
      href: `https://www.google.com/search?tbm=isch&q=${q}`,
    },
  ];
}
