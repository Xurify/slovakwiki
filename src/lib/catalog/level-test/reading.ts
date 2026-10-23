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
    id: "pekaren",
    level: "A1",
    kind: "narrative",
    opening: [
      "Peter pracuje v ",
      { id: "b1", options: ["pekáreň", "pekárne", "pekárni", "pekárňou"], answer: 2 },
      ". Každý deň vstáva o štvrtej ráno a pečie chlieb a ",
      { id: "b2", options: ["rožky", "rožkov", "rožkoch", "rožkami"], answer: 0 },
      ". Prví zákazníci ",
      {
        id: "b3",
        options: ["prichádza", "prichádzajú", "prichádzam", "prichádzať"],
        answer: 1,
      },
      " o siedmej. Každé ráno sem chodí aj pani Horváthová. Je to milá ",
      { id: "b4", options: ["starý", "staré", "starú", "stará"], answer: 3 },
      " pani a Peter ",
      { id: "b5", options: ["ona", "ju", "jej", "ňou"], answer: 1 },
      " dobre pozná. Dnes je už osem hodín, ale pani Horváthová tu nie je.",
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
      { id: "b1", options: ["dôležitý", "dôležitá", "dôležité", "dôležitú"], answer: 2 },
      " sviatky. Najdôležitejší je Štedrý večer, 24. ",
      { id: "b2", options: ["decembra", "december", "decembri", "decembrom"], answer: 0 },
      ". Celá rodina ",
      { id: "b3", options: ["sedia", "sedí", "sedím", "sedieť"], answer: 1 },
      " spolu pri stole. Na začiatku večere všetci jedia ",
      { id: "b4", options: ["oblátka", "oblátok", "oblátkach", "oblátky"], answer: 3 },
      " s medom. Potom je na stole kapustnica a vyprážaný kapor so ",
      {
        id: "b5",
        options: ["zemiakový", "zemiakového", "zemiakovým", "zemiakovou"],
        answer: 2,
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
        "Štedrý večer je pre rodiny na Slovensku dôležitý deň.",
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
    id: "kniznica",
    level: "A2",
    kind: "expository",
    opening: [
      "Mnohí si myslia, že knižnica je len miesto, kde si ľudia ",
      {
        id: "b1",
        options: ["požičiava", "požičiavajú", "požičiavame", "požičiavať"],
        answer: 1,
      },
      " knihy. Dnešná knižnica však ponúka oveľa viac. V mnohých ",
      { id: "b2", options: ["mesto", "mestá", "mestách", "miest"], answer: 2 },
      " má knižnica aj detský kútik, kde sa malé deti hrajú a počúvajú rozprávky. Dospelí tam môžu chodiť na ",
      { id: "b3", options: ["kurzy", "kurzov", "kurzoch", "kurzami"], answer: 0 },
      " angličtiny alebo na prednášky o histórii. Knižnica má aj počítače s ",
      { id: "b4", options: ["rýchly", "rýchleho", "rýchlou", "rýchlym"], answer: 3 },
      " internetom, ktoré môže každý používať zadarmo. Čitateľský preukaz stojí väčšinou len niekoľko ",
      { id: "b5", options: ["euro", "eurá", "eur", "eurách"], answer: 2 },
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
      { id: "b1", options: ["práca", "práce", "prácu", "práci"], answer: 1 },
      ". V autobuse si sadol k ",
      { id: "b2", options: ["okno", "okna", "oknu", "oknom"], answer: 2 },
      " a celú cestu si na mobile čítal ",
      { id: "b3", options: ["správy", "správ", "správach", "správami"], answer: 0 },
      ". Na svojej zastávke rýchlo vystúpil. Až pred kanceláriou si všimol, že mobil nechal na ",
      { id: "b4", options: ["sedadlo", "sedadla", "sedadlu", "sedadle"], answer: 3 },
      ". Autobus však už ",
      { id: "b5", options: ["odišla", "odišiel", "odišlo", "odišli"], answer: 1 },
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
    id: "stara-lipa",
    level: "B1",
    kind: "narrative",
    opening: [
      "Uprostred našej dediny rastie lipa, ktorá je staršia ako všetky domy v ",
      { id: "b1", options: ["okolie", "okolia", "okolí", "okolím"], answer: 2 },
      ". Minulú jeseň starosta ",
      {
        id: "b2",
        options: ["oznámil", "oznámila", "oznámilo", "oznámili"],
        answer: 0,
      },
      ", že ju dajú vyrúbať, lebo je chorá a mohla by spadnúť na cestu. Mnohých obyvateľov to ",
      {
        id: "b3",
        options: ["nahneval", "nahnevala", "nahnevalo", "nahnevali"],
        answer: 2,
      },
      ". Pod lipou sa totiž stretávali celé ",
      {
        id: "b4",
        options: ["generácia", "generácie", "generácií", "generáciám"],
        answer: 1,
      },
      ": deti sa pri nej hrali a starší ľudia v lete sedávali na ",
      { id: "b5", options: ["lavička", "lavičky", "lavičku", "lavičke"], answer: 3 },
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
      },
      " aktivitám. Keď po daždi príde teplé počasie, lesy sa zaplnia ľuďmi s ",
      { id: "b2", options: ["košík", "košíka", "košíky", "košíkmi"], answer: 3 },
      ". Mnohí sa túto záľubu naučili už ako deti od svojich ",
      { id: "b3", options: ["rodičia", "rodičov", "rodičom", "rodičmi"], answer: 1 },
      " alebo starých rodičov. Každý rok však skončí v nemocnici niekoľko ľudí, ktorí ",
      { id: "b4", options: ["zjedli", "zjedol", "zjesť", "zje"], answer: 0 },
      " jedovatú hubu. Najväčšie nebezpečenstvo predstavuje muchotrávka zelená, ktorá je ",
      {
        id: "b5",
        options: ["smrteľná", "smrteľne", "smrteľný", "smrteľnú"],
        answer: 1,
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
      "Huby treba nosiť v košíku, a nie v plastovej taške, v ktorej sa rýchlo kazia. Kto si nie je istý, môže nájdené huby ukázať v hubárskej poradni, kde ich odborník skontroluje.",
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
  {
    id: "z-banky-do-dielne",
    level: "B2",
    kind: "narrative",
    opening: [
      "Katarína pracovala desať rokov ako analytička vo veľkej banke. Navonok mala všetko, po čom mnohí ",
      { id: "b1", options: ["túžiaci", "túži", "túžiac", "túžia"], answer: 3 },
      ": dobrý plat, služobné auto a ",
      { id: "b2", options: ["istú", "istý", "istá", "istej"], answer: 0 },
      " budúcnosť. Postupne si však ",
      { id: "b3", options: ["začal", "začali", "začala", "začať"], answer: 2 },
      " všímať, že sa na pondelky vôbec neteší a že večer nemá silu ani na priateľov. Keď jej lekár odporučil, aby si vzala ",
      { id: "b4", options: ["dlhší", "dlhšie", "dlhšia", "dlhšiu"], answer: 1 },
      " voľno, rozhodla sa ho využiť na kurz stolárstva, o ktorom ",
      {
        id: "b5",
        options: ["snívali", "sníval", "snívalo", "snívala"],
        answer: 3,
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
      { id: "b1", options: ["zjesť", "zje", "zjedlo", "zjedené"], answer: 0 },
      ". Plytvanie potravinami pritom nie je len ",
      { id: "b2", options: ["etická", "etický", "etické", "etickou"], answer: 1 },
      " problém. Na výrobu vyhodeného jedla bolo treba vodu, energiu aj pôdu a zvyšky hnijúce na skládkach ",
      {
        id: "b3",
        options: ["uvoľňuje", "uvoľňovať", "uvoľňujú", "uvoľňujúce"],
        answer: 2,
      },
      " skleníkové plyny. Jednou z hlavných ",
      {
        id: "b4",
        options: ["príčina", "príčinám", "príčinami", "príčin"],
        answer: 3,
      },
      " plytvania je nesprávne chápanie údajov na obaloch. Údaj „spotrebujte do“ sa týka ",
      {
        id: "b5",
        options: ["bezpečnosti", "bezpečnosť", "bezpečnosťou", "bezpečnostiam"],
        answer: 0,
      },
      " potravín: keď tento dátum uplynie, výrobok by sa už nemal jesť.",
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
    id: "pamat",
    level: "C1",
    kind: "expository",
    opening: [
      "Ľudskú pamäť si často predstavujeme ako archív, v ktorom sú zážitky ",
      {
        id: "b1",
        options: ["uložení", "uložené", "uložená", "uložený"],
        answer: 1,
      },
      " v nezmenenej podobe. Psychologické výskumy však naznačujú, že spomienka sa zakaždým, keď si ju vybavíme, nanovo skladá z útržkov a medzery v nej mozog dopĺňa ",
      { id: "b2", options: ["to", "tomu", "tým", "tom"], answer: 2 },
      ", čo považuje za ",
      {
        id: "b3",
        options: ["pravdepodobný", "pravdepodobnej", "pravdepodobným", "pravdepodobné"],
        answer: 3,
      },
      ". Spomienky tak ",
      {
        id: "b4",
        options: ["podliehajú", "ovplyvňujú", "závisia", "trpia"],
        answer: 0,
      },
      " zmenám, o ktorých často ani netušíme. Presvedčivo to ukázal známy experiment zo 70. rokov, v ktorom účastníci ",
      {
        id: "b5",
        options: ["sledovaní", "sledovalo", "sledovali", "sledujúc"],
        answer: 2,
      },
      " film o dopravnej nehode.",
    ],
    missingSentence: {
      options: [
        "Väčšina z nich si nehodu zapamätala presne tak, ako sa stala.",
        "Film im však pustili až o týždeň neskôr.",
        "Jednej skupine potom položili otázku, ako rýchlo išli autá, keď do seba „vrazili“, druhej skupine, keď sa „dotkli“.",
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
      { id: "b1", options: ["naň", "doň", "oň", "preň"], answer: 1 },
      " po sobotách brával so sebou, a kým dospelí debatovali o pružinách a ozubených kolieskach, ja som fascinovane počúval, ako na stenách tikajú desiatky ",
      { id: "b2", options: ["hodiny", "hodinách", "hodín", "hodinami"], answer: 2 },
      ". Keď som sa po rokoch dozvedel, že starý pán Kováč obchod zatvára, zašiel som sa s ním rozlúčiť, hoci som nečakal, že by si ma ešte ",
      {
        id: "b3",
        options: ["pamätá", "pamätať", "pamätajúc", "pamätal"],
        answer: 3,
      },
      ". Spoznal ma však hneď a bez slova mi podal hodinky ",
      {
        id: "b4",
        options: ["zabalené", "zabalení", "zabalenú", "zabaliac"],
        answer: 0,
      },
      " v starých novinách. „Váš otec si ich tu dal ",
      {
        id: "b5",
        options: ["opravený", "opraviť", "opravil", "opravou"],
        answer: 1,
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
];
