import { markedText, type MarkedPart } from "$lib/learning/marked-text";
import type { DialogueTurn } from "$lib/learning/types";
import type { GrammarListen } from "../types";

const PREFIX = "listen-demonstratives-";

type Part = string | { d: string };

function line(id: string, speaker: string, parts: Part[], english: string): DialogueTurn {
  const marked = markedText(
    parts.map((part): MarkedPart =>
      typeof part === "string" ? part : { role: "demonstrative", text: part.d },
    ),
  );

  return {
    id: `${PREFIX}${id}`,
    speaker,
    slovak: marked.text,
    marks: marked.marks,
    english,
  };
}

/** One minute at home: a lost key, a neighbour at the window, every case in passing. */
export const demonstrativesListen: GrammarListen = {
  id: `${PREFIX}keys`,
  grammarSlug: "demonstratives",
  titleSk: "Kde je ten kľúč?",
  title: "Where is that key?",
  lines: [
    line(
      "marek-where-is-key",
      "Marek",
      ["Anna, kde je ", { d: "ten" }, " malý kľúč?"],
      "Anna, where is that small key?",
    ),
    line(
      "anna-this-or-that",
      "Anna",
      ["Ktorý? ", { d: "Tento" }, " alebo ", { d: "tamten" }, "?"],
      "Which one? This one or that one over there?",
    ),
    line(
      "marek-that-one-car",
      "Marek",
      [{ d: "Tamten" }, ". ", { d: "Ten" }, " od auta."],
      "That one over there. The car key.",
    ),
    line(
      "anna-in-that-bag",
      "Anna",
      ["Je v ", { d: "tej" }, " taške."],
      "It's in that bag.",
    ),
    line("marek-in-this-one", "Marek", ["V ", { d: "tejto" }, "?"], "In this one?"),
    line(
      "anna-in-that-one-window",
      "Anna",
      ["Nie, v ", { d: "tamtej" }, ". Pri ", { d: "tom" }, " okne."],
      "No, in that one over there. By that window.",
    ),
    line(
      "marek-got-it-who-is-man",
      "Marek",
      ["Aha, mám ho. A kto je ", { d: "ten" }, " muž vonku?"],
      "Got it. And who is that man outside?",
    ),
    line(
      "anna-neighbour-you-know-him",
      "Anna",
      [{ d: "To" }, " je náš sused, pán Novák. ", { d: "Toho" }, " muža poznáš."],
      "That's our neighbour, Mr Novák. You know that man.",
    ),
    line(
      "marek-with-that-woman",
      "Marek",
      ["Áno! Ide s ", { d: "tou" }, " ženou z obchodu."],
      "Yes! He's walking with that woman from the shop.",
    ),
    line(
      "anna-his-sister",
      "Anna",
      [{ d: "To" }, " je jeho sestra."],
      "That's his sister.",
    ),
    line(
      "marek-those-people-nice",
      "Marek",
      [{ d: "Tí" }, " ľudia sú milí."],
      "Those people are nice.",
    ),
    line(
      "anna-dont-lose-these-keys",
      "Anna",
      ["Áno. A ", { d: "tieto" }, " kľúče už nestrácaj!"],
      "Yes. And don't lose these keys again!",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-where-key`,
      prompt: "Where is the key?",
      replayLineId: `${PREFIX}anna-in-that-one-window`,
      choices: [
        { id: "far-bag", label: "V tamtej taške, pri okne." },
        {
          id: "this-bag",
          label: "V tejto taške.",
          whyWrong: "Marek asks **v tejto?** and Anna says **nie**.",
        },
        {
          id: "car",
          label: "V aute.",
          whyWrong: "It is the key **od auta**, the car key, but it is in a bag.",
        },
      ],
      answerId: "far-bag",
      feedback: {
        english: "No, in that one over there. By that window.",
        why: "Anna says **v tamtej**, in that bag over there, **pri tom okne**.",
      },
    },
    {
      id: `${PREFIX}check-toho`,
      promptSk: "___ muža poznáš.",
      prompt: "Which form did Anna say?",
      replayLineId: `${PREFIX}anna-neighbour-you-know-him`,
      choices: [
        { id: "toho", label: "toho" },
        {
          id: "ten",
          label: "ten",
          whyWrong:
            "**Ten** is the nominative. After **poznať** a man takes the accusative.",
        },
        { id: "tomu", label: "tomu", whyWrong: "**Tomu** is the dative: to that man." },
      ],
      answerId: "toho",
      feedback: {
        english: "You know that man.",
        why: "**Poznať** takes the accusative, and a man changes: **toho muža**.",
      },
    },
    {
      id: `${PREFIX}check-who-is-woman`,
      prompt: "Who is the woman with the neighbour?",
      replayLineId: `${PREFIX}anna-his-sister`,
      choices: [
        { id: "sister", label: "Jeho sestra." },
        {
          id: "wife",
          label: "Jeho žena.",
          whyWrong: "Anna says **sestra**, sister, not **žena**.",
        },
        {
          id: "neighbour",
          label: "Suseda.",
          whyWrong: "**Suseda** is a female neighbour. Anna says **jeho sestra**.",
        },
      ],
      answerId: "sister",
      feedback: {
        english: "That's his sister.",
        why: "Anna says **to je jeho sestra**: **to je** never changes, whoever it points at.",
      },
    },
  ],
};
