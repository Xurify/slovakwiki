import type { InteractiveReadingSet } from "$lib/level-test/types";

/**
 * Interactive Reading passages. Blanks test the form a frame forces (case,
 * agreement, person), the aspect the context calls for, or where a clitic
 * group sits (second in its clause, in fixed order), so each one has exactly
 * one fitting option; `area` names the part of Slovak the options differ in.
 * Highlight answers must be exact substrings of the full passage (opening with
 * the blanks filled, the missing sentence, the closing).
 */
export type AuthoredReadingSet = Omit<InteractiveReadingSet, "difficulty">;

export const readingSets: AuthoredReadingSet[] = [
  {
    id: "pekaren",
    level: "A1",
    kind: "narrative",
    opening: [
      "Peter pracuje v ",
      {
        id: "b1",
        options: ["pekáreň", "pekárne", "pekárni", "pekárňou"],
        answer: 2,
        area: "nouns",
      },
      ". Každý deň vstáva o štvrtej ráno a pečie chlieb a ",
      {
        id: "b2",
        options: ["rožky", "rožkov", "rožkoch", "rožkami"],
        answer: 0,
        area: "nouns",
      },
      ". Prví zákazníci ",
      {
        id: "b3",
        options: ["prichádza", "prichádzajú", "prichádzam", "prichádzať"],
        answer: 1,
        area: "conjugation",
      },
      " o siedmej. Každé ráno sem chodí aj pani Horváthová a ",
      { id: "b6", options: ["si kupuje", "kupuje si"], answer: 1, area: "wordOrder" },
      " chlieb. Je to milá ",
      {
        id: "b4",
        options: ["starý", "staré", "starú", "stará"],
        answer: 3,
        area: "adjectives",
      },
      " pani a Peter ",
      { id: "b5", options: ["ona", "ju", "jej", "ňou"], answer: 1, area: "pronouns" },
      " dobre pozná. Dnes je už osem hodín, ale pani Horváthová ešte ",
      { id: "b7", options: ["neprichádzala", "neprišla"], answer: 1, area: "aspect" },
      ".",
    ],
    missingSentence: {
      options: [
        "Peter dnes nepracuje, lebo je chorý.",
        "Pani Horváthová kupuje desať rožkov.",
        "Peter je nervózny a stále sa pozerá na dvere.",
        "Peter ide domov a spí.",
      ],
      answer: 2,
    },
    closing:
      "O deviatej je pani Horváthová konečne tu. Ide od lekára a všetko je v poriadku. Peter sa usmieva a dáva jej teplý rožok zadarmo.",
    highlights: [
      {
        question: "Kedy vstáva Peter?",
        english: "When does Peter get up?",
        answer: "o štvrtej ráno",
      },
      {
        question: "Odkiaľ ide pani Horváthová?",
        english: "Where is Mrs Horváthová coming from?",
        answer: "od lekára",
      },
    ],
    mainIdea: {
      options: [
        "Pani Horváthová pracuje v pekárni s Petrom.",
        "Peter nemá rád svoju prácu.",
        "Peter sa bojí o pani Horváthovú, ale ona je v poriadku.",
        "Peter predáva iba chlieb.",
      ],
      answer: 2,
    },
    title: {
      options: [
        "Ako upiecť chlieb",
        "Kde je pani Horváthová?",
        "Nová pekáreň v meste",
        "Peter ide k lekárovi",
      ],
      answer: 1,
    },
  },
  {
    id: "stedry-vecer",
    level: "A1",
    kind: "expository",
    opening: [
      "Vianoce sú na Slovensku veľmi ",
      {
        id: "b1",
        options: ["dôležitý", "dôležitá", "dôležité", "dôležitú"],
        answer: 2,
        area: "adjectives",
      },
      " sviatky. Najdôležitejší je Štedrý večer, 24. ",
      {
        id: "b2",
        options: ["decembra", "december", "decembri", "decembrom"],
        answer: 0,
        area: "nouns",
      },
      ". Celá rodina ",
      {
        id: "b3",
        options: ["sedia", "sedí", "sedím", "sedieť"],
        answer: 1,
        area: "conjugation",
      },
      " spolu pri stole a začína ",
      { id: "b6", options: ["večerať", "navečerať sa"], answer: 0, area: "aspect" },
      ". Na začiatku večere všetci jedia ",
      {
        id: "b4",
        options: ["oblátka", "oblátok", "oblátkach", "oblátky"],
        answer: 3,
        area: "nouns",
      },
      " s medom. ",
      { id: "b7", options: ["Potom si", "Si potom"], answer: 0, area: "wordOrder" },
      " dajú kapustnicu a vyprážaného kapra so ",
      {
        id: "b5",
        options: ["zemiakový", "zemiakového", "zemiakovým", "zemiakovou"],
        answer: 2,
        area: "adjectives",
      },
      " šalátom.",
    ],
    missingSentence: {
      options: [
        "Na Štedrý večer rodina nič neje.",
        "Po večeri deti hľadajú pod stromčekom darčeky.",
        "V lete je na Slovensku veľmi teplo.",
        "Potom všetci idú do práce.",
      ],
      answer: 1,
    },
    closing:
      "Darčeky na Slovensku nenosí Santa Claus, ale Ježiško. Na druhý deň ľudia často navštevujú starých rodičov alebo kamarátov.",
    highlights: [
      {
        question: "Čo jedia všetci na začiatku večere?",
        english: "What does everyone eat at the start of the dinner?",
        answer: "oblátky s medom",
      },
      {
        question: "Kto nosí darčeky na Slovensku?",
        english: "Who brings the presents in Slovakia?",
        answer: "Ježiško",
      },
    ],
    mainIdea: {
      options: [
        "Na Slovensku nie sú Vianoce dôležité.",
        "Slováci jedia kapra každý deň.",
        "Na Slovensku nosí darčeky Santa Claus.",
        "Štedrý večer je pre rodiny na Slovensku veľmi dôležitý.",
      ],
      answer: 3,
    },
    title: {
      options: [
        "Leto pri jazere",
        "Ako uvariť kapustnicu",
        "Štedrý večer na Slovensku",
        "Narodeniny v škole",
      ],
      answer: 2,
    },
  },
  {
    id: "novy-sused",
    level: "A1",
    kind: "narrative",
    opening: [
      "Vo vedľajšom byte býva nový sused. Volá sa Tomáš a je ",
      {
        id: "b1",
        options: ["mladý", "mladá", "mladé", "mladú"],
        answer: 0,
        area: "adjectives",
      },
      " kuchár. Pracuje v ",
      {
        id: "b2",
        options: ["reštaurácia", "reštaurácie", "reštaurácii", "reštauráciou"],
        answer: 2,
        area: "nouns",
      },
      " na námestí. Každý večer prichádza domov neskoro a ráno ",
      { id: "b7", options: ["si dlho", "dlho si"], answer: 0, area: "wordOrder" },
      " pospí. Dnes je sobota a Tomáš práve ",
      { id: "b6", options: ["pečie", "upečie"], answer: 0, area: "aspect" },
      " koláč. Celý byt ",
      {
        id: "b3",
        options: ["vonia", "voniam", "voňajú", "voňať"],
        answer: 0,
        area: "conjugation",
      },
      " po koláči. Zrazu niekto zazvoní pri dverách. Je to pani Nováková z tretieho ",
      {
        id: "b4",
        options: ["poschodie", "poschodia", "poschodí", "poschodím"],
        answer: 1,
        area: "nouns",
      },
      ". Tomáš ",
      {
        id: "b5",
        options: ["ona", "ju", "jej", "ňou"],
        answer: 2,
        area: "pronouns",
      },
      " ponúkne kúsok koláča.",
    ],
    missingSentence: {
      options: [
        "Pani Nováková sa sťažuje, že Tomáš je hlučný.",
        "Pani Nováková drží v ruke balík, ktorý prišiel pre Tomáša.",
        "Tomáš ide do práce do reštaurácie.",
        "Tomáš nemá rád koláče.",
      ],
      answer: 1,
    },
    closing:
      "Kuriér ho včera nechal u nej, lebo Tomáš nebol doma. Tomáš sa poďakuje a pani Nováková si koláč s radosťou vezme. Odvtedy sa susedia často navštevujú.",
    highlights: [
      {
        question: "Kde pracuje Tomáš?",
        english: "Where does Tomáš work?",
        answer: "v reštaurácii na námestí",
      },
      {
        question: "Prečo nechal kuriér balík u pani Novákovej?",
        english: "Why did the courier leave the parcel with Mrs Nováková?",
        answer: "lebo Tomáš nebol doma",
      },
    ],
    mainIdea: {
      options: [
        "Tomáš otvára novú reštauráciu.",
        "Nový sused a pani Nováková sa zoznámia vďaka balíku a koláču.",
        "Pani Nováková sa sťahuje na tretie poschodie.",
        "Tomáš sa učí piecť koláče.",
      ],
      answer: 1,
    },
    title: {
      options: [
        "Nová reštaurácia na námestí",
        "Ako poslať balík",
        "Koláč pre susedku",
        "Hlučný sused",
      ],
      answer: 2,
    },
  },
  {
    id: "bicykel",
    level: "A2",
    kind: "narrative",
    opening: [
      "Anna mala na narodeniny jedno veľké ",
      {
        id: "b1",
        options: ["želanie", "želania", "želaním", "želaniu"],
        answer: 0,
        area: "nouns",
      },
      ". Chcela nový bicykel, pretože jej starý bol už príliš ",
      {
        id: "b2",
        options: ["malá", "malý", "malé", "malého"],
        answer: 1,
        area: "adjectives",
      },
      ". Rodičia jej povedali, že si naň musí ",
      {
        id: "b3",
        options: ["zarába", "zarobila", "zarobiť", "zarábanie"],
        answer: 2,
        area: "conjugation",
      },
      " sama. Celé leto preto ",
      { id: "b6", options: ["pomáhala", "pomohla"], answer: 0, area: "aspect" },
      " susedom v ",
      {
        id: "b4",
        options: ["záhrada", "záhradu", "záhradou", "záhrade"],
        answer: 3,
        area: "nouns",
      },
      " a venčila ich psa. Za pomoc dostávala každý týždeň pár eur a ",
      {
        id: "b7",
        options: ["odkladala si ich", "si ich odkladala"],
        answer: 0,
        area: "wordOrder",
      },
      " do starej plechovej ",
      {
        id: "b5",
        options: ["krabice", "krabica", "krabicu", "krabici"],
        answer: 0,
        area: "nouns",
      },
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
    id: "kniznica",
    level: "A2",
    kind: "expository",
    opening: [
      { id: "b6", options: ["Si mnohí", "Mnohí si"], answer: 1, area: "wordOrder" },
      " myslia, že knižnica je len miesto, kde si ľudia ",
      {
        id: "b1",
        options: ["požičiava", "požičiavajú", "požičiavame", "požičiavať"],
        answer: 1,
        area: "conjugation",
      },
      " knihy. Dnešná knižnica však ponúka oveľa viac. V mnohých ",
      {
        id: "b2",
        options: ["mesto", "mestá", "mestách", "miest"],
        answer: 2,
        area: "nouns",
      },
      " má knižnica aj detský kútik, kde sa malé deti hrajú a počúvajú rozprávky. Dospelí tam môžu chodiť na ",
      {
        id: "b3",
        options: ["kurzy", "kurzov", "kurzoch", "kurzami"],
        answer: 0,
        area: "nouns",
      },
      " angličtiny alebo na prednášky o histórii. Knižnica má aj počítače s ",
      {
        id: "b4",
        options: ["rýchly", "rýchleho", "rýchlou", "rýchlym"],
        answer: 3,
        area: "adjectives",
      },
      " internetom, ktoré môže každý zadarmo ",
      { id: "b7", options: ["používať", "použiť"], answer: 0, area: "aspect" },
      " celé hodiny. Čitateľský preukaz stojí väčšinou len niekoľko ",
      { id: "b5", options: ["euro", "eurá", "eur", "eurách"], answer: 2, area: "nouns" },
      " ročne.",
    ],
    missingSentence: {
      options: [
        "Preto do knižnice chodia len dôchodcovia.",
        "Knihy si tam však nikto nemôže požičať.",
        "Počítače sú tam len pre zamestnancov.",
        "Deti ho majú často úplne zadarmo.",
      ],
      answer: 3,
    },
    closing:
      "Knižnice chcú, aby k nim chodilo viac mladých ľudí. Preto pre nich organizujú aj večery so spoločenskými hrami, filmové kluby a stretnutia so spisovateľmi.",
    highlights: [
      {
        question: "Čo robia malé deti v detskom kútiku?",
        english: "What do young children do in the children's corner?",
        answer: "hrajú a počúvajú rozprávky",
      },
      {
        question: "Koľko stojí čitateľský preukaz?",
        english: "How much does a library card cost?",
        answer: "len niekoľko eur ročne",
      },
    ],
    mainIdea: {
      options: [
        "Do knižnice smú chodiť iba študenti.",
        "Knižnica dnes ponúka nielen knihy, ale aj veľa ďalších služieb.",
        "Ľudia už do knižníc nechodia, lebo radšej čítajú doma.",
        "Čitateľský preukaz je veľmi drahý.",
      ],
      answer: 1,
    },
    title: {
      options: [
        "Najlepšie knihy roka",
        "Ako napísať knihu",
        "Nové počítače do školy",
        "Knižnica: viac než knihy",
      ],
      answer: 3,
    },
  },
  {
    id: "strateny-mobil",
    level: "A2",
    kind: "narrative",
    opening: [
      "Minulý piatok sa Martin ráno ponáhľal do ",
      {
        id: "b1",
        options: ["práca", "práce", "prácu", "práci"],
        answer: 1,
        area: "nouns",
      },
      ". Nastúpil do autobusu, ",
      { id: "b6", options: ["si sadol", "sadol si"], answer: 1, area: "wordOrder" },
      " k ",
      { id: "b2", options: ["okno", "okna", "oknu", "oknom"], answer: 2, area: "nouns" },
      " a celú cestu si na mobile čítal ",
      {
        id: "b3",
        options: ["správy", "správ", "správach", "správami"],
        answer: 0,
        area: "nouns",
      },
      ". Na svojej zastávke rýchlo vystúpil. Až pred kanceláriou si ",
      { id: "b7", options: ["všímal", "všimol"], answer: 1, area: "aspect" },
      ", že mobil nechal na ",
      {
        id: "b4",
        options: ["sedadlo", "sedadla", "sedadlu", "sedadle"],
        answer: 3,
        area: "nouns",
      },
      ". Autobus však už ",
      {
        id: "b5",
        options: ["odišla", "odišiel", "odišlo", "odišli"],
        answer: 1,
        area: "conjugation",
      },
      ".",
    ],
    missingSentence: {
      options: [
        "Mobil mal však celý čas vo vrecku.",
        "Vodič sa preto vrátil a mobil mu priniesol.",
        "Preto si od kolegyne požičal telefón a zavolal na svoje číslo.",
        "Na mobil potom celý deň vôbec nemyslel.",
      ],
      answer: 2,
    },
    closing:
      "V telefóne sa ozvala mladá žena. Mobil našla v autobuse a cez obed mu ho priniesla až do kancelárie. Martin jej na poďakovanie kúpil kávu a koláč.",
    highlights: [
      {
        question: "Kam si Martin sadol v autobuse?",
        english: "Where did Martin sit on the bus?",
        answer: "k oknu",
      },
      {
        question: "Čo kúpil Martin žene na poďakovanie?",
        english: "What did Martin buy the woman to say thank you?",
        answer: "kávu a koláč",
      },
    ],
    mainIdea: {
      options: [
        "Martin si kúpil nový mobil, lebo starý bol pomalý.",
        "Kolegyňa Martinovi ukradla mobil.",
        "Martin chodí do práce pešo.",
        "Martin stratil mobil, ale vďaka ochotnej žene ho dostal späť.",
      ],
      answer: 3,
    },
    title: {
      options: [
        "Ako si vybrať nový mobil",
        "Nový autobus v meste",
        "Mobil, ktorý sa vrátil",
        "Káva s kolegyňou",
      ],
      answer: 2,
    },
  },
  {
    id: "mestske-vcely",
    level: "B1",
    kind: "expository",
    opening: [
      "V posledných rokoch sa včely čoraz častejšie ",
      {
        id: "b1",
        options: ["objavuje", "objavujú", "objaví", "objavenie"],
        answer: 1,
        area: "conjugation",
      },
      " aj v mestách. Na strechách hotelov, škôl či kancelárskych budov pribúdajú ",
      { id: "b2", options: ["úľ", "úľov", "úle", "úľmi"], answer: 2, area: "nouns" },
      ". Mestské prostredie je pre včely prekvapivo ",
      {
        id: "b3",
        options: ["vhodné", "vhodná", "vhodný", "vhodne"],
        answer: 0,
        area: "adjectives",
      },
      ". Často ",
      { id: "b7", options: ["im sa", "sa im"], answer: 1, area: "wordOrder" },
      " v ňom darí lepšie ako na vidieku. V parkoch a záhradách totiž kvitne veľa rôznych rastlín, ktoré včely ",
      { id: "b6", options: ["navštevujú", "navštívia"], answer: 0, area: "aspect" },
      " celé leto, a mestá sú ",
      {
        id: "b4",
        options: ["teplý", "teplejšie", "najteplejšie", "teplo"],
        answer: 1,
        area: "adjectives",
      },
      " ako okolitá krajina. Navyše sa v nich používa menej ",
      {
        id: "b5",
        options: ["chemické", "chemickým", "chemickými", "chemických"],
        answer: 3,
        area: "adjectives",
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
    id: "stara-lipa",
    level: "B1",
    kind: "narrative",
    opening: [
      "Uprostred našej dediny ",
      { id: "b6", options: ["rastie", "vyrastie"], answer: 0, area: "aspect" },
      " lipa, ktorá je staršia ako všetky domy v ",
      {
        id: "b1",
        options: ["okolie", "okolia", "okolí", "okolím"],
        answer: 2,
        area: "nouns",
      },
      ". Minulú jeseň starosta ",
      {
        id: "b2",
        options: ["oznámil", "oznámila", "oznámilo", "oznámili"],
        answer: 0,
        area: "conjugation",
      },
      ", že ju dajú vyrúbať, lebo je chorá a ",
      { id: "b7", options: ["mohla by", "by mohla"], answer: 0, area: "wordOrder" },
      " spadnúť na cestu. Mnohých obyvateľov to ",
      {
        id: "b3",
        options: ["nahneval", "nahnevala", "nahnevalo", "nahnevali"],
        answer: 2,
        area: "conjugation",
      },
      ". Pod lipou sa totiž stretávali celé ",
      {
        id: "b4",
        options: ["generácia", "generácie", "generácií", "generáciám"],
        answer: 1,
        area: "nouns",
      },
      ": deti sa pri nej hrali a starší ľudia v lete sedávali na ",
      {
        id: "b5",
        options: ["lavička", "lavičky", "lavičku", "lavičke"],
        answer: 3,
        area: "nouns",
      },
      " v jej tieni.",
    ],
    missingSentence: {
      options: [
        "Všetci obyvatelia s rozhodnutím súhlasili.",
        "Niekoľko susedov sa preto rozhodlo, že sa ju pokúsia zachrániť.",
        "Lipu preto ešte v ten deň vyrúbali.",
        "Lipa medzitým sama spadla na cestu.",
      ],
      answer: 1,
    },
    closing:
      "Zavolali odborníka na stromy, ktorý zistil, že choré sú len niektoré konáre. Stačilo ich odrezať a strom bol opäť bezpečný. Lipa tak rastie na námestí ďalej a v júni zase rozvoniava po celej dedine.",
    highlights: [
      {
        question: "Prečo chceli lipu vyrúbať?",
        english: "Why did they want to cut the linden tree down?",
        answer: "je chorá a mohla by spadnúť na cestu",
      },
      {
        question: "Čo zistil odborník na stromy?",
        english: "What did the tree expert find?",
        answer: "choré sú len niektoré konáre",
      },
    ],
    mainIdea: {
      options: [
        "Stará lipa spadla na cestu a poškodila domy.",
        "Susedia zachránili starú lipu, ktorú chcela obec vyrúbať.",
        "Starosta dal v dedine vysadiť nové stromy.",
        "Deti sa radšej hrajú na ihrisku ako pod lipou.",
      ],
      answer: 1,
    },
    title: {
      options: [
        "Prečo sú lipy choré",
        "Ako vysadiť strom",
        "Nový starosta v dedine",
        "Lipa, ktorá zostala",
      ],
      answer: 3,
    },
  },
  {
    id: "zbieranie-hub",
    level: "B1",
    kind: "expository",
    opening: [
      "Zbieranie húb patrí na Slovensku k obľúbeným ",
      {
        id: "b1",
        options: ["jesenné", "jesenných", "jesenným", "jesennými"],
        answer: 2,
        area: "adjectives",
      },
      " aktivitám. Keď po daždi príde teplé počasie, lesy sa začnú ",
      { id: "b6", options: ["zapĺňať", "zaplniť"], answer: 0, area: "aspect" },
      " ľuďmi s ",
      {
        id: "b2",
        options: ["košík", "košíka", "košíky", "košíkmi"],
        answer: 3,
        area: "nouns",
      },
      ". Zbierať huby sa mnohí naučili už ako deti od svojich ",
      {
        id: "b3",
        options: ["rodičia", "rodičov", "rodičom", "rodičmi"],
        answer: 1,
        area: "nouns",
      },
      " alebo starých rodičov. Každý rok však skončí v nemocnici niekoľko ľudí, ktorí ",
      {
        id: "b4",
        options: ["zjedli", "zjedol", "zjesť", "zje"],
        answer: 0,
        area: "conjugation",
      },
      " jedovatú hubu, lebo ",
      { id: "b7", options: ["ju si", "si ju"], answer: 1, area: "wordOrder" },
      " pomýlili s jedlou. Najväčšie nebezpečenstvo predstavuje muchotrávka zelená, ktorá je ",
      {
        id: "b5",
        options: ["smrteľná", "smrteľne", "smrteľný", "smrteľnú"],
        answer: 1,
        area: "vocabulary",
      },
      " jedovatá.",
    ],
    missingSentence: {
      options: [
        "Zbieranie húb je preto na Slovensku zakázané.",
        "Muchotrávku zelenú preto predávajú v každom obchode.",
        "Huby sa preto najčastejšie zbierajú v zime.",
        "Odborníci preto radia zbierať iba huby, ktoré človek s istotou pozná.",
      ],
      answer: 3,
    },
    closing:
      "Huby treba nosiť v košíku, a nie v plastovej taške, v ktorej sa rýchlo kazia. Kto si nie je istý, môže nájdené huby ukázať v hubárskej poradni, kde ich odborník skontroluje. Takéto poradne bývajú počas sezóny otvorené v niektorých mestách.",
    highlights: [
      {
        question: "Od koho sa mnohí naučili zbierať huby?",
        english: "Who did many people learn mushroom picking from?",
        answer: "od svojich rodičov alebo starých rodičov",
      },
      {
        question: "Kde si človek môže dať skontrolovať nájdené huby?",
        english: "Where can people have the mushrooms they found checked?",
        answer: "v hubárskej poradni",
      },
    ],
    mainIdea: {
      options: [
        "Všetky huby v slovenských lesoch sú jedlé.",
        "Na Slovensku huby takmer nikto nezbiera.",
        "Zbieranie húb je obľúbené, ale treba pri ňom byť opatrný.",
        "Hubárske poradne predávajú huby.",
      ],
      answer: 2,
    },
    title: {
      options: [
        "Huby: radosť aj riziko",
        "Recept na hubovú polievku",
        "Najkrajšie lesy Európy",
        "Prečo lesy na Slovensku miznú",
      ],
      answer: 0,
    },
  },
  {
    id: "bicyklom-do-prace",
    level: "B1",
    kind: "expository",
    opening: [
      "V posledných rokoch jazdí na bicykli do práce čoraz viac ",
      {
        id: "b1",
        options: ["Slováci", "Slovákov", "Slovákom", "Slovákmi"],
        answer: 1,
        area: "nouns",
      },
      ". Mestá preto už niekoľko rokov ",
      { id: "b6", options: ["stavajú", "postavia"], answer: 0, area: "aspect" },
      " nové cyklotrasy a stojany na ",
      {
        id: "b2",
        options: ["bicykel", "bicykle", "bicyklov", "bicykloch"],
        answer: 1,
        area: "nouns",
      },
      ". Jazda na bicykli má veľa výhod: je lacná, zdravá a človek ",
      {
        id: "b3",
        options: ["nestojí", "nestoja", "nestojím", "nestáť"],
        answer: 0,
        area: "conjugation",
      },
      " v zápchach. Mnohí ľudia ",
      { id: "b7", options: ["sa boja", "boja sa"], answer: 0, area: "wordOrder" },
      " jazdiť po cestách medzi autami. Ak patríte medzi ",
      {
        id: "b5",
        options: ["oni", "ich", "im", "nich"],
        answer: 3,
        area: "pronouns",
      },
      ", skúste najprv jazdiť len po cyklotrasách. Najbezpečnejšie sa jazdí tam, kde je cyklotrasa ",
      {
        id: "b4",
        options: ["oddelený", "oddelená", "oddelené", "oddelenú"],
        answer: 1,
        area: "adjectives",
      },
      " od cesty.",
    ],
    missingSentence: {
      options: [
        "Bicykle sú však také drahé, že si ich málokto môže dovoliť.",
        "Mestá preto chcú zakázať bicykle v centre.",
        "Preto je dôležité, aby boli cyklotrasy bezpečné a dobre prepojené.",
        "Najlepšie je jazdiť na bicykli v noci, keď je menej áut.",
      ],
      answer: 2,
    },
    closing:
      "Tam, kde mestá do cyklotrás investovali, sa počet cyklistov za pár rokov zdvojnásobil. Menej áut v uliciach pritom pomáha všetkým, aj tým, ktorí na bicykli nejazdia.",
    highlights: [
      {
        question: "Aké výhody má jazda na bicykli?",
        english: "What are the advantages of cycling?",
        answer: "je lacná, zdravá a človek nestojí v zápchach",
      },
      {
        question: "Čo sa stalo tam, kde mestá investovali do cyklotrás?",
        english: "What happened where towns invested in cycle paths?",
        answer: "počet cyklistov za pár rokov zdvojnásobil",
      },
    ],
    mainIdea: {
      options: [
        "Bicykel je vo všetkom lepší ako auto.",
        "Na bicykli jazdí do práce čoraz viac ľudí a mestá im musia vytvoriť bezpečné podmienky.",
        "Jazda na bicykli je nebezpečná, a preto ju mestá obmedzujú.",
        "Cyklisti a vodiči áut sa nemajú radi.",
      ],
      answer: 1,
    },
    title: {
      options: [
        "Ako opraviť bicykel",
        "Zápchy v centre mesta",
        "Nový zákon pre vodičov",
        "Na bicykli do práce",
      ],
      answer: 3,
    },
  },
  {
    id: "styri-dni",
    level: "B2",
    kind: "expository",
    opening: [
      "Myšlienka štvordňového pracovného týždňa sa ešte nedávno ",
      {
        id: "b1",
        options: ["zdal", "zdali", "zdala", "zdalo"],
        answer: 2,
        area: "conjugation",
      },
      " nereálna. Dnes ju však viaceré firmy v Európe skúšajú v ",
      {
        id: "b2",
        options: ["prax", "praxi", "praxou", "praxe"],
        answer: 1,
        area: "nouns",
      },
      " a niektorým sa ju už podarilo ",
      { id: "b6", options: ["zavádzať", "zaviesť"], answer: 1, area: "aspect" },
      " natrvalo. Zamestnanci pracujú štyri dni v týždni, no mzda ",
      { id: "b7", options: ["sa im", "im sa"], answer: 0, area: "wordOrder" },
      " pritom ",
      {
        id: "b3",
        options: ["neznižuje", "neznižujú", "neznížili", "neznižovať"],
        answer: 0,
        area: "conjugation",
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
        area: "adjectives",
      },
      " a v práci sa lepšie sústredia. Prvé výsledky ",
      {
        id: "b5",
        options: ["naznačuje", "naznačovať", "naznačený", "naznačujú"],
        answer: 3,
        area: "conjugation",
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
  {
    id: "z-banky-do-dielne",
    level: "B2",
    kind: "narrative",
    opening: [
      "Katarína pracovala desať rokov ako analytička vo veľkej banke. Navonok mala všetko, po čom mnohí ",
      {
        id: "b1",
        options: ["túžiaci", "túži", "túžiac", "túžia"],
        answer: 3,
        area: "conjugation",
      },
      ": dobrý plat, služobné auto a ",
      {
        id: "b2",
        options: ["istú", "istý", "istá", "istej"],
        answer: 0,
        area: "adjectives",
      },
      " budúcnosť. Postupne si však ",
      {
        id: "b3",
        options: ["začal", "začali", "začala", "začať"],
        answer: 2,
        area: "conjugation",
      },
      " ",
      { id: "b6", options: ["všímať", "všimnúť"], answer: 0, area: "aspect" },
      ", že sa na pondelky vôbec neteší a že večer nemá silu ani na priateľov. Keď jej lekár odporučil, aby si vzala ",
      {
        id: "b4",
        options: ["dlhší", "dlhšie", "dlhšia", "dlhšiu"],
        answer: 1,
        area: "adjectives",
      },
      " voľno, rozhodla ",
      { id: "b7", options: ["ho sa", "sa ho"], answer: 1, area: "wordOrder" },
      " využiť na kurz stolárstva, o ktorom ",
      {
        id: "b5",
        options: ["snívali", "sníval", "snívalo", "snívala"],
        answer: 3,
        area: "conjugation",
      },
      " už od detstva.",
    ],
    missingSentence: {
      options: [
        "Kurz ju však sklamal, a tak sa po mesiaci vrátila do banky.",
        "Práca s drevom ju totiž nikdy nebavila.",
        "Lekár jej preto prácu s drevom zakázal.",
        "Už po prvom týždni v dielni vedela, že sa do banky nevráti.",
      ],
      answer: 3,
    },
    closing:
      "Dnes má vlastnú dielňu a vyrába nábytok na zákazku. Zarába menej ako kedysi a okrem práce s drevom musí zvládať aj účtovníctvo a komunikáciu so zákazníkmi. Napriek tomu tvrdí, že sa na pondelky po prvý raz v živote teší.",
    highlights: [
      {
        question: "Čo mala Katarína v banke?",
        english: "What did Katarína have at the bank?",
        answer: "dobrý plat, služobné auto a istú budúcnosť",
      },
      {
        question: "Čo musí Katarína zvládať okrem práce s drevom?",
        english: "Apart from working with wood, what does Katarína have to handle?",
        answer: "účtovníctvo a komunikáciu so zákazníkmi",
      },
    ],
    mainIdea: {
      options: [
        "Stolárstvo je lepšie platené ako práca v banke.",
        "Katarína odišla z dobre platenej práce a v remesle našla spokojnosť.",
        "Lekári odporúčajú každému zmeniť prácu.",
        "Katarína v banke zbohatla a kúpila si dielňu.",
      ],
      answer: 1,
    },
    title: {
      options: [
        "Prečo nemáme radi pondelky",
        "Ako získať úver v banke",
        "Z kancelárie do dielne",
        "Stolárom za jeden týždeň",
      ],
      answer: 2,
    },
  },
  {
    id: "plytvanie-jedlom",
    level: "B2",
    kind: "expository",
    opening: [
      "Európske domácnosti každoročne vyhodia obrovské množstvo jedla, ktoré by sa ešte dalo ",
      {
        id: "b1",
        options: ["zjesť", "zje", "zjedlo", "zjedené"],
        answer: 0,
        area: "conjugation",
      },
      ". Plytvanie potravinami pritom nie je len ",
      {
        id: "b2",
        options: ["etická", "etický", "etické", "etickou"],
        answer: 1,
        area: "adjectives",
      },
      " problém. Na výrobu vyhodeného jedla bolo treba vodu, energiu aj pôdu. Zvyšky, ktoré celé mesiace ",
      { id: "b6", options: ["hnijú", "zhnijú"], answer: 0, area: "aspect" },
      " na skládkach, navyše ",
      {
        id: "b3",
        options: ["uvoľňuje", "uvoľňovať", "uvoľňujú", "uvoľňujúce"],
        answer: 2,
        area: "conjugation",
      },
      " skleníkové plyny. Jednou z hlavných ",
      {
        id: "b4",
        options: ["príčina", "príčinám", "príčinami", "príčin"],
        answer: 3,
        area: "nouns",
      },
      " plytvania je nesprávne chápanie údajov na obaloch. Údaj „spotrebujte do“ sa týka ",
      {
        id: "b5",
        options: ["bezpečnosti", "bezpečnosť", "bezpečnosťou", "bezpečnostiam"],
        answer: 0,
        area: "nouns",
      },
      " potravín: keď tento dátum uplynie, výrobok ",
      { id: "b7", options: ["by sa", "sa by"], answer: 0, area: "wordOrder" },
      " už nemal jesť.",
    ],
    missingSentence: {
      options: [
        "Údaj „minimálna trvanlivosť do“ preto znamená, že výrobok je po tomto dátume jedovatý.",
        "Supermarkety preto musia predávať všetky potraviny bez obalu.",
        "Údaj „minimálna trvanlivosť do“ však iba udáva, dokedy výrobca zaručuje plnú chuť a kvalitu.",
        "Väčšina jedla sa preto vyhadzuje už na poliach.",
      ],
      answer: 2,
    },
    closing:
      "Cestoviny, ryža či sušienky sú preto často v poriadku aj dlho po tomto dátume. Kto si pred nákupom napíše zoznam a doma najprv skontroluje chladničku, ušetrí nielen jedlo, ale aj peniaze.",
    highlights: [
      {
        question: "Čo uvoľňujú zvyšky jedla na skládkach?",
        english: "What do food scraps rotting in landfills release?",
        answer: "skleníkové plyny",
      },
      {
        question: "Ako môže človek ušetriť jedlo aj peniaze?",
        english: "How can people save both food and money?",
        answer: "pred nákupom napíše zoznam a doma najprv skontroluje chladničku",
      },
    ],
    mainIdea: {
      options: [
        "Potraviny po dátume minimálnej trvanlivosti sú vždy nebezpečné.",
        "Skládky sú najlepším riešením pre zvyšky jedla.",
        "Európske domácnosti nakupujú stále menej potravín.",
        "Veľa jedla sa vyhadzuje zbytočne, často pre nepochopené údaje na obale.",
      ],
      answer: 3,
    },
    title: {
      options: [
        "Jedlo, ktoré nemuselo skončiť v koši",
        "Ako vybrať najlepší jogurt",
        "Nová skládka za mestom",
        "Prečo sú potraviny v Európe drahšie",
      ],
      answer: 0,
    },
  },
  {
    id: "nocny-vlak",
    level: "B2",
    kind: "narrative",
    opening: [
      "Keď Mária nastúpila do nočného vlaku do Košíc, vonku ešte stále ",
      { id: "b6", options: ["pršalo", "zapršalo"], answer: 0, area: "aspect" },
      ". V kupé už sedel starší pán, ktorý si čítal ",
      {
        id: "b1",
        options: ["noviny", "novín", "novinách", "novinami"],
        answer: 0,
        area: "nouns",
      },
      ". Mária si vyložila kufor na poličku a ",
      { id: "b7", options: ["sadla si", "si sadla"], answer: 0, area: "wordOrder" },
      " k oknu. Po chvíli sa pán ",
      {
        id: "b2",
        options: ["opýtal", "opýtala", "opýtalo", "opýtali"],
        answer: 0,
        area: "conjugation",
      },
      ", či by mu nepožičala nabíjačku na telefón, lebo svoju zabudol doma. Mária mu ",
      {
        id: "b5",
        options: ["ona", "ju", "jej", "ňou"],
        answer: 1,
        area: "pronouns",
      },
      " ochotne podala. Rozprávali sa celú noc: pán bol ",
      {
        id: "b3",
        options: ["bývalý", "bývalá", "bývalého", "bývalým"],
        answer: 0,
        area: "adjectives",
      },
      " rušňovodič a o vlakoch vedel všetko. Ráno, keď vlak prichádzal do ",
      {
        id: "b4",
        options: ["Košice", "Košíc", "Košiciach", "Košicami"],
        answer: 1,
        area: "nouns",
      },
      ", pán zrazu zbledol.",
    ],
    missingSentence: {
      options: [
        "Vlak mal pre poruchu dve hodiny meškanie.",
        "Mária zaspala a prespala celú cestu.",
        "Uvedomil si, že nemá peňaženku: zostala doma pri nabíjačke.",
        "Pán vystúpil už v Žiline a Mária zostala v kupé sama.",
      ],
      answer: 2,
    },
    closing:
      "Mária mu ponúkla, že mu požičia peniaze na taxík, a vymenili si telefónne čísla. O týždeň jej prišiel balík: nová nabíjačka, vrátené peniaze a pozvánka na jazdu v rušni, ktorý kedysi viedol.",
    highlights: [
      {
        question: "Prečo si pán požičal nabíjačku?",
        english: "Why did the man borrow a charger?",
        answer: "svoju zabudol doma",
      },
      {
        question: "Čo bolo v balíku, ktorý Mária dostala?",
        english: "What was in the parcel Mária received?",
        answer: "nová nabíjačka, vrátené peniaze a pozvánka na jazdu v rušni",
      },
    ],
    mainIdea: {
      options: [
        "Náhodné stretnutie vo vlaku sa skončilo nečakaným priateľstvom.",
        "Mária pracuje ako rušňovodička.",
        "Nočné vlaky na Slovensku často meškajú.",
        "Starší pán predáva nabíjačky na telefóny.",
      ],
      answer: 0,
    },
    title: {
      options: [
        "Noc v kupé",
        "Ako sa stať rušňovodičom",
        "Meškanie na trati",
        "Nový vlak do Košíc",
      ],
      answer: 0,
    },
  },
  {
    id: "pamat",
    level: "C1",
    kind: "expository",
    opening: [
      "Ľudskú pamäť si často predstavujeme ako archív, v ktorom sú zážitky ",
      {
        id: "b1",
        options: ["uložení", "uložené", "uložená", "uložený"],
        answer: 1,
        area: "adjectives",
      },
      " v nezmenenej podobe. Psychologické výskumy však naznačujú, že spomienka sa zakaždým, keď ",
      { id: "b6", options: ["si ju", "ju si"], answer: 0, area: "wordOrder" },
      " vybavíme, nanovo skladá z útržkov a medzery v nej mozog dopĺňa ",
      { id: "b2", options: ["to", "tomu", "tým", "tom"], answer: 2, area: "pronouns" },
      ", čo považuje za ",
      {
        id: "b3",
        options: ["pravdepodobný", "pravdepodobnej", "pravdepodobným", "pravdepodobné"],
        answer: 3,
        area: "adjectives",
      },
      ". Spomienky tak ",
      {
        id: "b4",
        options: ["podliehajú", "ovplyvňujú", "závisia", "trpia"],
        answer: 0,
        area: "vocabulary",
      },
      " zmenám, o ktorých často ani netušíme. Presvedčivo sa to podarilo ",
      { id: "b7", options: ["ukazovať", "ukázať"], answer: 1, area: "aspect" },
      " v známom experimente zo 70. rokov, v ktorom účastníci ",
      {
        id: "b5",
        options: ["sledovaní", "sledovalo", "sledovali", "sledujúc"],
        answer: 2,
        area: "conjugation",
      },
      " film o dopravnej nehode.",
    ],
    missingSentence: {
      options: [
        "Väčšina z nich si nehodu zapamätala presne tak, ako sa stala.",
        "Film im však pustili až o týždeň neskôr.",
        "Jednej skupine potom položili otázku, ako rýchlo išli autá, keď do seba „vrazili“, a druhej skupine tú istú otázku so slovesom „narazili“.",
        "Vedci z toho vyvodili, že pamäť funguje ako spoľahlivý videozáznam.",
      ],
      answer: 2,
    },
    closing:
      "Tí, ktorí počuli dramatickejšie sloveso, odhadovali vyššiu rýchlosť a o týždeň neskôr si častejšie „spomenuli“ na rozbité sklo, hoci vo filme žiadne nebolo. Jediné slovo v otázke teda stačilo na to, aby sa spomienka zmenila, čo má vážne dôsledky najmä pre výpovede svedkov.",
    highlights: [
      {
        question: "Čím mozog dopĺňa medzery v spomienke?",
        english: "What does the brain fill the gaps in a memory with?",
        answer: "tým, čo považuje za pravdepodobné",
      },
      {
        question:
          "Na čo si častejšie spomenuli účastníci, ktorí počuli dramatickejšie sloveso?",
        english:
          "What did the participants who heard the more dramatic verb recall more often?",
        answer: "na rozbité sklo",
      },
    ],
    mainIdea: {
      options: [
        "Pamäť uchováva zážitky presne tak, ako sa stali.",
        "Spomienky sa menia, keď si ich vybavujeme, a ovplyvniť ich môže aj formulácia otázky.",
        "Svedkovia dopravných nehôd zámerne klamú.",
        "Dramatické filmy poškodzujú ľudskú pamäť.",
      ],
      answer: 1,
    },
    title: {
      options: [
        "Ako sa vyhnúť dopravnej nehode",
        "Prečo svedkovia na súde klamú",
        "Najznámejšie filmy 70. rokov",
        "Pamäť nie je videozáznam",
      ],
      answer: 3,
    },
  },
  {
    id: "hodinar",
    level: "C1",
    kind: "narrative",
    opening: [
      "Hodinárstvo na rohu našej ulice som poznal z detstva. Otec ma ",
      {
        id: "b1",
        options: ["naň", "doň", "oň", "preň"],
        answer: 1,
        area: "functionWords",
      },
      " po sobotách brával so sebou, a kým dospelí debatovali o pružinách a ozubených kolieskach, ja som fascinovane počúval, ako na stenách tikajú desiatky ",
      {
        id: "b2",
        options: ["hodiny", "hodinách", "hodín", "hodinami"],
        answer: 2,
        area: "nouns",
      },
      ". Keď som sa po rokoch ",
      { id: "b6", options: ["dozvedal", "dozvedel"], answer: 1, area: "aspect" },
      ", že starý pán Kováč obchod zatvára, ",
      {
        id: "b7",
        options: ["som sa zašiel", "zašiel som sa", "zašiel sa som"],
        answer: 1,
        area: "wordOrder",
      },
      " s ním rozlúčiť, hoci som nečakal, že by si ma ešte ",
      {
        id: "b3",
        options: ["pamätá", "pamätať", "pamätajúc", "pamätal"],
        answer: 3,
        area: "conjugation",
      },
      ". Spoznal ma však hneď a bez slova mi podal hodinky ",
      {
        id: "b4",
        options: ["zabalené", "zabalení", "zabalenú", "zabaliac"],
        answer: 0,
        area: "adjectives",
      },
      " v starých novinách. „Váš otec si ich tu dal ",
      {
        id: "b5",
        options: ["opravený", "opraviť", "opravil", "opravou"],
        answer: 1,
        area: "conjugation",
      },
      " pár týždňov pred smrťou. Nikdy si po ne neprišiel,“ povedal potichu.",
    ],
    missingSentence: {
      options: [
        "Pán Kováč si ma však vôbec nepamätal.",
        "Hodinky som mu však vrátil, pretože som o ne nestál.",
        "Keď som noviny rozbalil, spoznal som otcove hodinky, ktoré som ako chlapec toľko obdivoval.",
        "Otec mi ich totiž daroval už dávno predtým.",
      ],
      answer: 2,
    },
    closing:
      "Odvtedy ich nosím každý deň. Nastavil som ich o dve minúty napred, ako to vždy robil otec, aby nikam nemeškal.",
    highlights: [
      {
        question: "Čo robil rozprávač ako dieťa, kým dospelí debatovali?",
        english: "What did the narrator do as a child while the adults talked?",
        answer: "počúval, ako na stenách tikajú desiatky hodín",
      },
      {
        question: "Prečo si otec nastavoval hodinky napred?",
        english: "Why did the father set his watch fast?",
        answer: "aby nikam nemeškal",
      },
    ],
    mainIdea: {
      options: [
        "Rozprávač sa vyučil za hodinára a prevzal obchod pána Kováča.",
        "Pán Kováč zatvára obchod, lebo ľudia už nenosia hodinky.",
        "Rozprávač dostal po rokoch hodinky, ktoré si otec dal opraviť, a nosí ich na jeho pamiatku.",
        "Otec rozprávača pracoval celý život ako hodinár.",
      ],
      answer: 2,
    },
    title: {
      options: [
        "Ako opraviť pokazené hodinky",
        "Obchod, ktorý nikdy nezatvorili",
        "Hodinky, ktoré idú napred",
        "Posledný deň v škole",
      ],
      answer: 2,
    },
  },
  {
    id: "cena-ticha",
    level: "C1",
    kind: "expository",
    opening: [
      "Ticho sa v dnešnom svete stáva ",
      {
        id: "b1",
        options: ["luxus", "luxusu", "luxusom", "luxuse"],
        answer: 2,
        area: "nouns",
      },
      ". Podľa Svetovej zdravotníckej organizácie je hluk po znečistenom ovzduší druhým ",
      {
        id: "b2",
        options: [
          "najzávažnejší",
          "najzávažnejšie",
          "najzávažnejším",
          "najzávažnejšieho",
        ],
        answer: 2,
        area: "adjectives",
      },
      " environmentálnym rizikom pre zdravie v Európe. Ľudia, ktorí dlhodobo ",
      { id: "b6", options: ["žijú", "prežijú"], answer: 0, area: "aspect" },
      " pri rušných cestách, horšie spia a častejšie trpia vysokým ",
      {
        id: "b3",
        options: ["tlak", "tlaku", "tlakom", "tlaky"],
        answer: 2,
        area: "nouns",
      },
      ". Organizmus totiž na hluk ",
      {
        id: "b4",
        options: ["reaguje", "reagujú", "reagujem", "reagovať"],
        answer: 0,
        area: "conjugation",
      },
      " stresom aj vtedy, keď ",
      { id: "b7", options: ["si ho", "ho si"], answer: 0, area: "wordOrder" },
      " vedome nevšímame. Niektoré mestá preto chránia takzvané tiché zóny, parky a nádvoria, kam sa obyvatelia môžu utiahnuť, keď ",
      {
        id: "b5",
        options: ["oni", "ich", "im", "nimi"],
        answer: 2,
        area: "pronouns",
      },
      " hluk prerastie cez hlavu.",
    ],
    missingSentence: {
      options: [
        "Hluk však zdraviu neškodí, ak si naň človek zvykne.",
        "Tiché zóny sa preto v mestách postupne rušia.",
        "Prvé výsledky sú sľubné: návštevníci týchto miest uvádzajú nižšiu mieru stresu.",
        "Najhlučnejším mestom v Európe je podľa prieskumov Bratislava.",
      ],
      answer: 2,
    },
    closing:
      "Odborníci však upozorňujú, že samotné zóny nestačia. Skutočná zmena si vyžaduje tichšie povrchy ciest, prísnejšie limity pre nočnú dopravu a územné plánovanie, ktoré s hlukom počíta od začiatku.",
    highlights: [
      {
        question: "Čo je podľa WHO väčším rizikom pre zdravie ako hluk?",
        english: "According to the WHO, what is a bigger health risk than noise?",
        answer: "znečistenom ovzduší",
      },
      {
        question: "Čo si podľa odborníkov vyžaduje skutočná zmena?",
        english: "According to experts, what does real change require?",
        answer:
          "tichšie povrchy ciest, prísnejšie limity pre nočnú dopravu a územné plánovanie",
      },
    ],
    mainIdea: {
      options: [
        "Hluk vážne škodí zdraviu a mestá s ním musia bojovať systematicky, nielen tichými zónami.",
        "Tiché zóny úplne vyriešili problém hluku v mestách.",
        "Ľudia v mestách spia lepšie ako na vidieku.",
        "Svetová zdravotnícka organizácia odporúča sťahovať sa na vidiek.",
      ],
      answer: 0,
    },
    title: {
      options: [
        "Ako sa naučiť spať",
        "Cena ticha",
        "Najrušnejšie cesty Európy",
        "Nové pravidlá pre cyklistov",
      ],
      answer: 1,
    },
  },
];
