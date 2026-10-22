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

/**
 * The weather in Bratislava, all of it in one hour: sun, clouds, rain and
 * snow in the park by the Danube, each as the lines name it.
 */
export const WEATHER_TODAY: DialogueTurn[] = [
  {
    english: "What's the weather like today?",
    id: "dev-weather-alex-ask",
    sayChoices: {
      answerId: "weather",
      choices: [
        { id: "weather", label: "Aké je dnes počasie?" },
        {
          id: "time",
          label: "Koľko je hodín?",
          whyWrong: "**Koľko je hodín?** asks the time. The weather is **počasie**.",
        },
        {
          id: "where",
          label: "Kde je počasie?",
          whyWrong:
            "**Kde** asks where something is. For what the weather is like, ask **aké**.",
        },
      ],
    },
    slovak: "Aké je dnes počasie?",
    speaker: "You",
  },
  {
    english: "Nice. The sun is shining and it's warm.",
    id: "dev-weather-anna-sun",
    slovak: "Pekné. Svieti slnko a je teplo.",
    speaker: "Anna",
  },
  {
    english: "Great. Are we going for a walk?",
    id: "dev-weather-alex-walk",
    slovak: "Super. Ideme na prechádzku?",
    speaker: "You",
  },
  {
    english: "Yes. But look, clouds are coming.",
    id: "dev-weather-anna-clouds",
    slovak: "Áno. Ale pozri, prichádzajú oblaky.",
    speaker: "Anna",
  },
  {
    english: "Hm. It's cloudy.",
    id: "dev-weather-alex-cloudy",
    sayChoices: {
      answerId: "cloudy",
      choices: [
        { id: "cloudy", label: "Hm. Je oblačno." },
        {
          id: "sunny",
          label: "Hm. Je slnečno.",
          whyWrong: "**Slnečno** is sunny. The clouds have just come: **oblačno**.",
        },
        {
          id: "noun",
          label: "Hm. Je oblak.",
          whyWrong:
            "**Oblak** is the thing, a cloud. The weather word is **oblačno**: cloudy.",
        },
      ],
    },
    slovak: "Hm. Je oblačno.",
    speaker: "You",
  },
  {
    english: "Yes. And now it's raining!",
    id: "dev-weather-anna-rain",
    slovak: "Áno. A teraz prší!",
    speaker: "Anna",
  },
  {
    english: "Oh no. I don't have an umbrella.",
    id: "dev-weather-alex-umbrella",
    slovak: "Ach nie. Nemám dáždnik.",
    speaker: "You",
  },
  {
    english: "Me neither. And it's cold!",
    id: "dev-weather-anna-cold",
    slovak: "Ja tiež nie. A je zima!",
    speaker: "Anna",
  },
  {
    english: "Look! It's snowing!",
    id: "dev-weather-alex-snow",
    sayChoices: {
      answerId: "snow",
      choices: [
        { id: "snow", label: "Pozri! Sneží!" },
        {
          id: "rain",
          label: "Pozri! Prší!",
          whyWrong: "**Prší** is rain. White flakes are **sneh**, and it **sneží**.",
        },
        {
          id: "sun",
          label: "Pozri! Svieti slnko!",
          whyWrong: "**Svieti slnko** says the sun is out. Those are snowflakes.",
        },
      ],
    },
    slovak: "Pozri! Sneží!",
    speaker: "You",
  },
  {
    english: "Snowing? In October?!",
    id: "dev-weather-anna-october",
    slovak: "Sneží? V októbri?!",
    speaker: "Anna",
  },
  {
    english: "Sun, clouds, rain, snow. In one hour.",
    id: "dev-weather-alex-hour",
    slovak: "Slnko, oblaky, dážď, sneh. Za jednu hodinu.",
    speaker: "You",
  },
  {
    english: "That's Bratislava. Let's go home!",
    id: "dev-weather-anna-home",
    slovak: "To je Bratislava. Poďme domov!",
    speaker: "Anna",
  },
];
