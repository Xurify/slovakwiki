import type { ClozeHint } from "$lib/learning/types";

export const agreementHint: ClozeHint = {
  chip: "ten · tá · to",
  grammarTopicId: "demonstratives",
  note: "**Ten**, **tá**, **to** take the gender of the noun, and the ending usually shows it: nouns ending in a consonant take **ten** (*ten kufor*), in **-a** take **tá** (*tá taška*), and in **-o** or **-e** take **to** (*to auto*). Watch for *ten kolega*, *to dievča*, *to dieťa*, and *tá noc*. **Tento** and **tamten** follow the same pattern: *táto taška*, *tamto auto*.",
};

export const pluralHint: ClozeHint = {
  chip: "tí · tie",
  grammarTopicId: "demonstratives",
  note: "Only masculine nouns for people take **tí** (**títo**, **tamtí**): *tí muži*, *tí ľudia*. Every other plural takes **tie**, people included: *tie ženy*, *tie deti*, *tie kľúče*.",
};

export const toJeHint: ClozeHint = {
  chip: "To je …",
  grammarTopicId: "demonstratives",
  note: "On its own, **to** means this, that, or it. In **to je** and **to sú** it stays **to**, whatever the noun: *To je kľúč.* *To je taška.* *To sú kľúče.* Only the verb changes: **je** for one, **sú** for more. Before a noun, use the form that matches it: *tá taška*.",
};

export const seriesHint: ClozeHint = {
  chip: "tento · tamten",
  grammarTopicId: "demonstratives",
  note: "**Tento** is this one here, **tamten** is that one over there, and plain **ten** is the everyday choice. All three agree like **ten**: *túto tašku*, *tamtú tašku*.",
};

export const caseHint: ClozeHint = {
  chip: "ten + case",
  grammarTopicId: "demonstratives",
  note: "The demonstrative takes the same case as its noun: *toho muža*, *tomu chlapcovi*, *o tej žene*, *s tým chlapcom*. **Tento** adds **-to**: *tohto*, *tomuto*, *túto*, *týmto*.",
};

export const animateHint: ClozeHint = {
  chip: "toho / ten",
  grammarTopicId: "demonstratives",
  note: "In the accusative singular, masculine nouns for people and animals change, and **ten** becomes **toho**: *Poznám toho muža.* *Vidím toho psa.* Masculine things keep **ten**: *Vidím ten dom.* In the plural, only people take **tých**: *Poznám tých chlapcov.*",
};

export const tymHint: ClozeHint = {
  chip: "tým · tými",
  grammarTopicId: "demonstratives",
  note: "**Tým** is masculine and neuter instrumental singular (*s tým chlapcom*; feminine is *s tou ženou*) and dative plural for every noun (*tým deťom*). **Tými** is instrumental plural: *s tými chlapcami*.",
};

export const roleHint: ClozeHint = {
  chip: "The case shows the role",
  grammarTopicId: "demonstratives",
  note: "Slovak word order is free, so the ending shows who does what. *Poznám toho muža* and *Toho muža poznám* both mean I know him. *Ten muž ma pozná* means he knows me.",
};
