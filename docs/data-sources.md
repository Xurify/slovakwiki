# Data sources

Canonical links for Slovak Wiki content tooling and public attribution.
Keep this file aligned with `src/lib/catalog/data-sources/catalog.ts`.

## Dictionary

Lexical reference used for curated dictionary entries.

### JÚĽŠ Slovak dictionary (slovník)

Primary source link on curated dictionary entries.

- [slovnik.juls.savba.sk](https://slovnik.juls.savba.sk/)
- [Jazykovedný ústav Ľ. Štúra](https://www.juls.savba.sk/)

## Corpus and frequency

Trusted frequency lists for the most common lemmas by part of speech.

### Slovak National Corpus (SNK) frequency lists

Top-2500 noun and top-2000 verb lemmas from the full SNK count dumps, plus top-1000 adjective and adverb lemmas from the SNK HTML lists, used on /dictionary/common and frequency publish.

- [Frequency lists overview (EN)](https://korpus.sk/en/frequency-lists-of-lemmata-word-forms-and-parts-of-speech-from-the-publicly-available-snc-corpora/)
- [Full noun lemma frequency dump (BZ2)](https://korpus.juls.savba.sk/files/prim-8.0/tag/prim-8.0-public-all-S-lemma-frequency.bz2)
- [prim-8.0-public-all top 1000 index](https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/)
- [Full verb lemma frequency dump (BZ2)](https://korpus.juls.savba.sk/files/prim-8.0/tag/prim-8.0-public-all-V-lemma-frequency.bz2)
- [Top 1000 noun lemmas](https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/prim-8-0-public-all-substantives-top-1000-lemmas/)
- [Top 1000 adjective lemmas](https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/prim-8-0-public-all-adjectives-top-1000-lemmas/)
- [Top 1000 adverb lemmas](https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/prim-8-0-public-all-adverbs-top-1000-lemmas/)

## Example sentences

SK–EN sentence pairs attached to live dictionary entries when available.

### Tatoeba

SK–EN example sentences on live dictionary words via dump enrichment. Not used as a frequency source.

License: CC BY 2.0 FR (attribute Tatoeba)

- [Downloads UI (sentence pairs + weekly exports)](https://tatoeba.org/en/downloads)
- [Raw weekly exports](https://downloads.tatoeba.org/exports/)
- [API (optional; not used in v1)](https://api.tatoeba.org/)
  - Reserved for future on-demand lookup. Enrichment uses dumps.
- [Using the Tatoeba corpus](https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus)
