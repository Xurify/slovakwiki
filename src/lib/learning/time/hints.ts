import type { ClozeHint } from "$lib/learning/types";

/** Grammar chip for hour agreement in telling-time phrases (Je/Sú + hodina/hodiny/hodín). */
export const hodinaAgreementHint: ClozeHint = {
  chip: "Je / Sú + hour forms",
  grammarTopicId: "telling-time",
  note: "With **2–4** hours use **Sú** + **hodiny**: *Sú dve/tri/štyri hodiny.* With **1** use **Je** + **hodina**; with **5+** use **Je** + **hodín**: *Je jedna hodina.* / *Je päť hodín.* The same agreement applies to minutes: *jedna minúta*, *dve minúty*, *päť minút.*",
};

/** Koľko je hodín? vs O koľkej? registers. */
export const registersHint: ClozeHint = {
  chip: "Koľko / O",
  grammarTopicId: "telling-time",
  note: "**Koľko je hodín?** asks what time it is → answer with **Je/Sú …**. **O koľkej?** or **Kedy?** ask when something happens → answer with **O …** (appointment form).",
};

/** Okolo vs exact O appointment. */
export const okoloHint: ClozeHint = {
  chip: "Okolo / O",
  grammarTopicId: "telling-time",
  note: "**Okolo tretej** means *around three* — approximate. **O tretej** means *at three* — exact appointment time.",
};

/** Day-part tags disambiguate morning vs evening on the same face. */
export const dayPartHint: ClozeHint = {
  chip: "ráno / večer",
  grammarTopicId: "telling-time",
  note: "Add a day-part when the face alone is ambiguous: **ráno**, **doobeda** / **dopoludnia**, **naobed** / **napoludnie**, **poobede** / **popoludní**, **večer**, **v noci**. *O štvrť na sedem ráno* vs *O štvrť na sedem večer.*",
};
