import type { ClozeHint } from "$lib/learning/types";

export const agreementHint: ClozeHint = {
  chip: "ten · tá · to",
  grammarTopicId: "demonstratives",
  note: "**Ten**, **tá**, **to** take the gender of the noun: *ten muž*, *tá žena*, *to dievča*. **Dievča** is neuter, even though it names a person. **Tento** and **tamten** follow the same pattern: *táto torta*, *tamten koláč*.",
};

export const pluralHint: ClozeHint = {
  chip: "tí · tie",
  grammarTopicId: "demonstratives",
  note: "Only masculine nouns for people take **tí** (**títo**, **tamtí**): *tí muži*, *tí kolegovia*. Every other plural takes **tie**, people included: *tie ženy*, *tie deti*, *tie fotky*.",
};

export const toJeHint: ClozeHint = {
  chip: "To je …",
  grammarTopicId: "demonstratives",
  note: "On its own, **to** means this, that, or it, and it never changes: *To je dom.* *To je torta.* *To sú fotky.* Only the verb follows the noun. **Ten** and **tá** agree only with a noun right after them: *tá torta*.",
};

export const seriesHint: ClozeHint = {
  chip: "tento · tamten",
  grammarTopicId: "demonstratives",
  note: "**Tento** is this one here, **tamten** is that one over there, and plain **ten** is the everyday choice. All three agree like **ten**: *túto tortu*, *tamtú tortu*.",
};

export const caseHint: ClozeHint = {
  chip: "ten + case",
  grammarTopicId: "demonstratives",
  note: "The demonstrative takes the same case as its noun: *toho muža*, *tomu chlapcovi*, *na tej fotke*, *s tým chlapcom*. **Tento** adds **-to**: *tohto*, *tomuto*, *túto*, *týmto*.",
};

export const animateHint: ClozeHint = {
  chip: "toho / ten",
  grammarTopicId: "demonstratives",
  note: "In the accusative, masculine nouns for people change, and **ten** becomes **toho**: *Poznám toho muža.* Masculine things keep **ten**: *Vidím ten dom.* In the plural, people take **tých**: *Poznám tých chlapcov.*",
};

export const tymHint: ClozeHint = {
  chip: "tým · tými",
  grammarTopicId: "demonstratives",
  note: "**Tým** is instrumental singular (*s tým chlapcom*) and dative plural (*tým deťom*). **Tými** is instrumental plural: *s tými chlapcami*.",
};

export const roleHint: ClozeHint = {
  chip: "The case shows the role",
  grammarTopicId: "demonstratives",
  note: "Slovak word order is free, so the ending shows who does what. *Poznám toho muža* and *Toho muža poznám* both mean I know him. *Ten muž ma pozná* means he knows me.",
};
