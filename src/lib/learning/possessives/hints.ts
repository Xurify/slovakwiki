import type { ClozeHint } from "$lib/learning/types";

export const agreementHint: ClozeHint = {
  chip: "môj · moja · moje",
  grammarTopicId: "grammatical-gender",
  note: "**Môj**, **tvoj**, **náš**, **váš** take the gender of the thing owned, not the owner: *môj brat*, *moja sestra*, *moje auto*. In the plural, only masculine nouns for people take **-i**: *moji priatelia*, *naši študenti*. Every other plural takes **-e**, including feminine nouns for people and animals: *moje sestry*, *moje psy*, *moje kľúče*.",
};

export const fixedOwnerHint: ClozeHint = {
  chip: "jeho · jej · ich",
  note: "**Jeho** (his), **jej** (her), **ich** (their) never change. They follow the owner, not the noun: *jej brat*, *jej bratovi*, *s jej bratom*.",
};

export const svojHint: ClozeHint = {
  chip: "svoj = the subject's own",
  note: "When the owner is the subject of the sentence, use **svoj**: *Tom volá svojej mame* (his own mom). **Jeho mame** would be another man's mom. Svoj never sits in the subject itself.",
};

export const caseHint: ClozeHint = {
  chip: "Possessive + case",
  grammarTopicId: "cases-overview",
  note: "The possessive takes the same case as its noun: *môjho brata*, *môjmu bratovi*, *s mojím bratom*, *o mojej sestre*. **Jeho**, **jej**, **ich** are the exception — they never change.",
};

export const instrumentalDativeHint: ClozeHint = {
  chip: "naším / našim",
  grammarTopicId: "cases-overview",
  note: "Long **-ím** is instrumental singular: *s naším bratom*, *s mojím otcom*. Short **-im** is dative plural: *našim rodičom*, *mojim priateľom*.",
};

export const whoseHint: ClozeHint = {
  chip: "čí · čia · čie",
  note: "**Čí** agrees with the thing, like **môj**: *Čí je to kľúč?*, *Čia je to taška?*, *Čie je to auto?*, *Čie sú to kľúče?*",
};

export const nameOwnerHint: ClozeHint = {
  chip: "Petrov · Annina",
  note: "One named person becomes an adjective: **Peter → Petrov**, **Anna → Annin**. It agrees with the thing: *Petrov brat*, *Petrova sestra*, *Petrovo auto*, *Annina taška*.",
};

export const bodyPartHint: ClozeHint = {
  chip: "si, not môj",
  note: "Slovak does not name the owner of your own body or clothes. **Si** already says whose: *Umývam si ruky*, *Obliekam si kabát*.",
};
