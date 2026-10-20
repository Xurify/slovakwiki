import type { InteractiveReadingSet } from "$lib/level-test/types";

/**
 * Interactive Reading passages. Blanks test the form a frame forces (case,
 * agreement, person), so each one has exactly one fitting option. Highlight
 * answers must be exact substrings of the full passage (opening with the
 * blanks filled, the missing sentence, the closing).
 */
export type AuthoredReadingSet = Omit<InteractiveReadingSet, "difficulty">;

export const readingSets: AuthoredReadingSet[] = [
  {
    id: "bicykel",
    level: "A2",
    kind: "narrative",
    opening: [
      "Anna mala na narodeniny jedno veľké ",
      { id: "b1", options: ["želanie", "želania", "želaním", "želaniu"], answer: 0 },
      ". Chcela nový bicykel, pretože jej starý bol už príliš ",
      { id: "b2", options: ["malá", "malý", "malé", "malého"], answer: 1 },
      ". Rodičia jej povedali, že si naň musí ",
      { id: "b3", options: ["zarába", "zarobila", "zarobiť", "zarábanie"], answer: 2 },
      " sama. Celé leto preto pomáhala susedom v ",
      { id: "b4", options: ["záhrada", "záhradu", "záhradou", "záhrade"], answer: 3 },
      " a venčila ich psa. Každý týždeň si odkladala peniaze do starej plechovej ",
      { id: "b5", options: ["krabice", "krabica", "krabicu", "krabici"], answer: 0 },
      ".",
    ],
    missingSentence: {
      options: [
        "Bicykel jej ukradli hneď v prvý deň.",
        "Na konci augusta mala konečne dosť peňazí.",
        "Rodičia jej kúpili nové auto.",
        "V zime sa naučila lyžovať.",
      ],
      answer: 1,
    },
    closing:
      "S otcom išla do obchodu a vybrala si červený bicykel s košíkom. Odvtedy na ňom jazdí každý deň do školy a je na seba hrdá, že si ho kúpila z vlastných peňazí.",
    highlights: [
      {
        question: "Prečo chcela Anna nový bicykel?",
        english: "Why did Anna want a new bike?",
        answer: "jej starý bol už príliš malý",
      },
      {
        question: "Ako Anna zarábala peniaze?",
        english: "How did Anna earn money?",
        answer: "pomáhala susedom v záhrade a venčila ich psa",
      },
    ],
    mainIdea: {
      options: [
        "Anna dostala bicykel od rodičov zadarmo.",
        "Anna nemá rada leto, lebo musí pracovať.",
        "Anna si vlastnou prácou zarobila na bicykel.",
        "Susedia Anne kúpili psa.",
      ],
      answer: 2,
    },
    title: {
      options: [
        "Leto pri mori",
        "Bicykel z vlastných peňazí",
        "Ako opraviť starý bicykel",
        "Nový pes v susedstve",
      ],
      answer: 1,
    },
  },
  {
    id: "mestske-vcely",
    level: "B1",
    kind: "expository",
    opening: [
      "V posledných rokoch sa včely čoraz častejšie ",
      { id: "b1", options: ["objavuje", "objavujú", "objaví", "objavenie"], answer: 1 },
      " aj v mestách. Na strechách hotelov, škôl či kancelárskych budov pribúdajú ",
      { id: "b2", options: ["úľ", "úľov", "úle", "úľmi"], answer: 2 },
      ". Mestské prostredie je pre včely prekvapivo ",
      { id: "b3", options: ["vhodné", "vhodná", "vhodný", "vhodne"], answer: 0 },
      ". V parkoch a záhradách totiž kvitne veľa rôznych rastlín a mestá sú ",
      { id: "b4", options: ["teplý", "teplejšie", "najteplejšie", "teplo"], answer: 1 },
      " ako okolitá krajina. Navyše sa v nich používa menej ",
      {
        id: "b5",
        options: ["chemické", "chemickým", "chemickými", "chemických"],
        answer: 3,
      },
      " prostriedkov než na poliach.",
    ],
    missingSentence: {
      options: [
        "Včely v meste preto rýchlo vymierajú.",
        "Na poliach sa preto už vôbec nepoužívajú chemikálie.",
        "Mestá preto zakázali chov včiel.",
        "Med z mestských úľov býva preto prekvapivo kvalitný.",
      ],
      answer: 3,
    },
    closing:
      "Včelári však upozorňujú, že samotné úle nestačia. Ak má mesto včelám skutočne pomôcť, potrebuje viac zelene a kvitnúcich rastlín, a to nielen pre včely chované človekom, ale aj pre divé opeľovače.",
    highlights: [
      {
        question: "Kde v meste pribúdajú úle?",
        english: "Where in the city are more and more hives appearing?",
        answer: "Na strechách hotelov, škôl či kancelárskych budov",
      },
      {
        question: "Čo podľa včelárov mesto potrebuje?",
        english: "According to beekeepers, what does a city need?",
        answer: "viac zelene a kvitnúcich rastlín",
      },
    ],
    mainIdea: {
      options: [
        "Mestá môžu byť pre včely dobrým miestom, ak majú dosť zelene.",
        "Včely sa v meste necítia dobre, lebo je tam hluk.",
        "Med z vidieka je vždy lepší ako med z mesta.",
        "Na strechách by sa nemali stavať žiadne zariadenia.",
      ],
      answer: 0,
    },
    title: {
      options: [
        "Ako vyrobiť med doma",
        "Prečo včely vymierajú na poliach",
        "Včely na mestských strechách",
        "Nové hotely v centre mesta",
      ],
      answer: 2,
    },
  },
  {
    id: "styri-dni",
    level: "B2",
    kind: "expository",
    opening: [
      "Myšlienka štvordňového pracovného týždňa sa ešte nedávno ",
      { id: "b1", options: ["zdal", "zdali", "zdala", "zdalo"], answer: 2 },
      " nereálna. Dnes ju však viaceré firmy v Európe skúšajú v ",
      { id: "b2", options: ["prax", "praxi", "praxou", "praxe"], answer: 1 },
      ". Zamestnanci pracujú štyri dni v týždni, no ich mzda sa ",
      {
        id: "b3",
        options: ["neznižuje", "neznižujú", "neznížili", "neznižovať"],
        answer: 0,
      },
      ". Zástancovia tvrdia, že ľudia sú vďaka dlhšiemu voľnu ",
      {
        id: "b4",
        options: [
          "odpočinutejšie",
          "odpočinutejšia",
          "odpočinutejší",
          "odpočinutejšieho",
        ],
        answer: 2,
      },
      " a v práci sa lepšie sústredia. Prvé výsledky ",
      {
        id: "b5",
        options: ["naznačuje", "naznačovať", "naznačený", "naznačujú"],
        answer: 3,
      },
      ", že produktivita v mnohých prípadoch neklesla.",
    ],
    missingSentence: {
      options: [
        "Kritici však upozorňujú, že tento model nie je vhodný pre každé odvetvie.",
        "Všetky firmy na Slovensku ho preto zaviedli už pred desiatimi rokmi.",
        "Zamestnanci preto musia v piatok pracovať dvakrát dlhšie.",
        "Produktivita je preto jediným dôvodom, prečo ľudia pracujú.",
      ],
      answer: 0,
    },
    closing:
      "V nemocniciach, obchodoch či vo výrobe, kde je potrebná nepretržitá prítomnosť ľudí, by skrátený týždeň znamenal nutnosť prijať ďalších zamestnancov. Zdá sa teda, že štvordňový týždeň nebude univerzálnym riešením, ale skôr možnosťou pre niektoré profesie.",
    highlights: [
      {
        question: "Čo ukazujú prvé výsledky?",
        english: "What do the first results show?",
        answer: "produktivita v mnohých prípadoch neklesla",
      },
      {
        question: "Čo by skrátený týždeň znamenal pre nemocnice a obchody?",
        english: "What would a shorter week mean for hospitals and shops?",
        answer: "nutnosť prijať ďalších zamestnancov",
      },
    ],
    mainIdea: {
      options: [
        "Štvordňový týždeň znižuje mzdy zamestnancov.",
        "Nemocnice už prešli na štvordňový týždeň.",
        "Produktivita v Európe neustále klesá.",
        "Štvordňový týždeň má výhody, ale nehodí sa pre všetky profesie.",
      ],
      answer: 3,
    },
    title: {
      options: [
        "Štyri dni práce: riešenie pre každého?",
        "Ako nájsť prácu v nemocnici",
        "Prečo ľudia nechcú dovolenku",
        "História piatku",
      ],
      answer: 0,
    },
  },
];
