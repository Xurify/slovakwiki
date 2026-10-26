/** Shared attribution sources for the site and offline utils. */

export type ReferenceGroupId = "dictionary" | "corpus" | "examples" | "sounds";

export interface ReferenceLink {
  href: string;
  label: string;
  note?: string;
}

export interface ReferenceSource {
  id: string;
  name: string;
  usedFor: string;
  license?: string;
  links: ReferenceLink[];
  group: ReferenceGroupId;
}

export interface ReferenceGroup {
  id: ReferenceGroupId;
  title: string;
  summary: string;
}

export const referenceGroups: ReferenceGroup[] = [
  {
    id: "dictionary",
    title: "Dictionary",
    summary: "Lexical reference used for curated dictionary entries.",
  },
  {
    id: "corpus",
    title: "Corpus and frequency",
    summary: "Trusted frequency lists for the most common lemmas by part of speech.",
  },
  {
    id: "examples",
    title: "Example sentences",
    summary: "SK–EN sentence pairs attached to live dictionary entries when available.",
  },
  {
    id: "sounds",
    title: "Sounds",
    summary: "Recordings heard in listening episodes that no voice can say.",
  },
];

export const referenceSources: ReferenceSource[] = [
  {
    id: "juls-slovnik",
    group: "dictionary",
    name: "JÚĽŠ Slovak dictionary (slovník)",
    usedFor: "Primary source link on curated dictionary entries.",
    links: [
      {
        href: "https://slovnik.juls.savba.sk/",
        label: "slovnik.juls.savba.sk",
      },
      {
        href: "https://www.juls.savba.sk/",
        label: "Jazykovedný ústav Ľ. Štúra",
      },
    ],
  },
  {
    id: "snk-frequency",
    group: "corpus",
    name: "Slovak National Corpus (SNK) frequency lists",
    usedFor:
      "Top-3000 noun and top-2000 verb lemmas from the full SNK count dumps, plus top-1000 adjective and adverb lemmas from the SNK HTML lists, used on /dictionary/common and frequency publish.",
    links: [
      {
        href: "https://korpus.sk/en/frequency-lists-of-lemmata-word-forms-and-parts-of-speech-from-the-publicly-available-snc-corpora/",
        label: "Frequency lists overview (EN)",
      },
      {
        href: "https://korpus.juls.savba.sk/files/prim-8.0/tag/prim-8.0-public-all-S-lemma-frequency.bz2",
        label: "Full noun lemma frequency dump (BZ2)",
      },
      {
        href: "https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/",
        label: "prim-8.0-public-all top 1000 index",
      },
      {
        href: "https://korpus.juls.savba.sk/files/prim-8.0/tag/prim-8.0-public-all-V-lemma-frequency.bz2",
        label: "Full verb lemma frequency dump (BZ2)",
      },
      {
        href: "https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/prim-8-0-public-all-substantives-top-1000-lemmas/",
        label: "Top 1000 noun lemmas",
      },
      {
        href: "https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/prim-8-0-public-all-adjectives-top-1000-lemmas/",
        label: "Top 1000 adjective lemmas",
      },
      {
        href: "https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/prim-8-0-public-all-adverbs-top-1000-lemmas/",
        label: "Top 1000 adverb lemmas",
      },
    ],
  },
  {
    id: "snk-treebank",
    group: "corpus",
    name: "Slovak National Corpus treebank (UD Slovak-SNK)",
    usedFor:
      "Checks the grammatical gender of dictionary nouns. Gender comes from the Slovak ending rule plus a reviewed exceptions list (content/dictionary/noun-gender-exceptions.json); scripts/dictionary/assign-noun-gender.ts flags any noun the treebank's hand annotation disagrees with.",
    license: "CC BY-SA 4.0",
    links: [
      {
        href: "https://github.com/UniversalDependencies/UD_Slovak-SNK",
        label: "UD_Slovak-SNK (CoNLL-U files)",
      },
      {
        href: "https://universaldependencies.org/treebanks/sk_snk/index.html",
        label: "Treebank documentation",
      },
    ],
  },
  {
    id: "tatoeba",
    group: "examples",
    name: "Tatoeba",
    usedFor:
      "SK–EN example sentences on live dictionary words via dump enrichment. Not used as a frequency source.",
    license: "CC BY 2.0 FR (attribute Tatoeba)",
    links: [
      {
        href: "https://tatoeba.org/en/downloads",
        label: "Downloads UI (sentence pairs + weekly exports)",
      },
      {
        href: "https://downloads.tatoeba.org/exports/",
        label: "Raw weekly exports",
      },
      {
        href: "https://api.tatoeba.org/",
        label: "API (optional; not used in v1)",
        note: "Reserved for future on-demand lookup. Enrichment uses dumps.",
      },
      {
        href: "https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus",
        label: "Using the Tatoeba corpus",
      },
    ],
  },
  {
    id: "dog-barking",
    group: "sounds",
    name: "Dog barking, by Dr. Nono YesMaybe (Wikimedia Commons)",
    usedFor:
      "Every bark of Bobík, the dog in the story Čo hovorí Bobík?, cut from this one recording by scripts/audio/barks.ts.",
    license: "CC BY-SA 4.0",
    links: [
      {
        href: "https://commons.wikimedia.org/wiki/File:Dog_barking.webm",
        label: "File:Dog barking.webm",
      },
      {
        href: "https://creativecommons.org/licenses/by-sa/4.0",
        label: "CC BY-SA 4.0",
      },
    ],
  },
];

export function referencesByGroup(groupId: ReferenceGroupId): ReferenceSource[] {
  return referenceSources.filter((source) => source.group === groupId);
}

export function formatReferencesMarkdown(): string {
  const lines: string[] = [
    "# Data sources",
    "",
    "Canonical links for Slovak Wiki content tooling and public attribution.",
    "Keep this file aligned with `src/lib/catalog/data-sources/catalog.ts`.",
    "",
  ];

  for (const group of referenceGroups) {
    lines.push(`## ${group.title}`, "", group.summary, "");

    for (const source of referencesByGroup(group.id)) {
      lines.push(`### ${source.name}`, "", source.usedFor, "");

      if (source.license) {
        lines.push(`License: ${source.license}`, "");
      }

      for (const link of source.links) {
        lines.push(`- [${link.label}](${link.href})`);
        if (link.note) {
          lines.push(`  - ${link.note}`);
        }
      }

      lines.push("");
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}
