import type { DialogueTurn } from "$lib/learning/types";

/**
 * A scene the lessons do not have yet, to try the stage with rain, a walk
 * to the stop and a tram pulling in: Anna and Alex caught in the rain,
 * waiting for the tram. Voiced like a lesson scene.
 */
export const RAIN_AND_TRAM: DialogueTurn[] = [
  {
    english: "It's raining! And it's cold.",
    id: "dev-rain-tram-anna-rain",
    slovak: "Prší! A je zima.",
    speaker: "Anna",
  },
  {
    english: "Do you have an umbrella?",
    id: "dev-rain-tram-alex-umbrella",
    sayChoices: {
      answerId: "umbrella",
      choices: [
        { id: "umbrella", label: "Máš dáždnik?" },
        {
          id: "sun",
          label: "Je pekne.",
          whyWrong:
            "**Je pekne** says the weather is nice. Anna just said **prší**: it is raining.",
        },
        {
          id: "ticket",
          label: "Máš lístok?",
          whyWrong:
            "**Lístok** is a ticket. In the rain you ask for a **dáždnik**, an umbrella.",
        },
      ],
    },
    slovak: "Máš dáždnik?",
    speaker: "You",
  },
  {
    english: "I don't. Let's take the tram.",
    id: "dev-rain-tram-anna-tram",
    slovak: "Nemám. Poďme na električku.",
    speaker: "Anna",
  },
  {
    english: "OK. Where is the stop?",
    id: "dev-rain-tram-alex-where",
    slovak: "Dobre. Kde je zastávka?",
    speaker: "You",
  },
  {
    english: "There, by the bench. Come on!",
    id: "dev-rain-tram-anna-bench",
    slovak: "Tam, pri lavičke. Poď!",
    speaker: "Anna",
  },
  {
    english: "Which tram goes to the centre?",
    id: "dev-rain-tram-alex-which",
    sayChoices: {
      answerId: "which",
      choices: [
        { id: "which", label: "Ktorá električka ide do centra?" },
        {
          id: "who",
          label: "Kto ide do centra?",
          whyWrong:
            "**Kto** asks about a person. For one tram out of many, ask **ktorá**: which.",
        },
        {
          id: "where-from",
          label: "Odkiaľ ide električka?",
          whyWrong:
            "**Odkiaľ** asks where it comes from. You want to know where it goes: **do centra**.",
        },
      ],
    },
    slovak: "Ktorá električka ide do centra?",
    speaker: "You",
  },
  {
    english: "Number four. It comes in five minutes.",
    id: "dev-rain-tram-anna-four",
    slovak: "Štvorka. Príde o päť minút.",
    speaker: "Anna",
  },
  {
    english: "Do you have a ticket?",
    id: "dev-rain-tram-alex-ticket",
    slovak: "Máš lístok?",
    speaker: "You",
  },
  {
    english: "Yes, I do. And you?",
    id: "dev-rain-tram-anna-yes",
    slovak: "Áno, mám. A ty?",
    speaker: "Anna",
  },
  {
    english: "No, I don't. Where do I buy a ticket?",
    id: "dev-rain-tram-alex-buy",
    sayChoices: {
      answerId: "buy",
      choices: [
        { id: "buy", label: "Nie, nemám. Kde kúpim lístok?" },
        {
          id: "have",
          label: "Áno, mám.",
          whyWrong:
            "**Mám** means you have one. Alex has no ticket yet, so it is **nemám**, and then ask where to buy one.",
        },
        {
          id: "when",
          label: "Nie, nemám. Kedy kúpim lístok?",
          whyWrong: "**Kedy** asks when. You want to know where: **kde**.",
        },
      ],
    },
    slovak: "Nie, nemám. Kde kúpim lístok?",
    speaker: "You",
  },
  {
    english: "On the tram. You can pay by card.",
    id: "dev-rain-tram-anna-card",
    slovak: "V električke. Môžeš platiť kartou.",
    speaker: "Anna",
  },
  {
    english: "Look, here it comes!",
    gestures: ["point"],
    id: "dev-rain-tram-alex-coming",
    slovak: "Aha, už ide!",
    speaker: "You",
  },
  {
    english: "Finally! Let's get on.",
    id: "dev-rain-tram-anna-on",
    slovak: "Konečne! Nastúpme.",
    speaker: "Anna",
  },
];
