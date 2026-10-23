import type { SpeakingPrompt, WritingPrompt } from "$lib/level-test/types";

/**
 * Production task prompts. They address the learner with `vy` throughout and
 * avoid gendered forms (`rád`, past tense) so one wording fits everyone.
 */

/** Dictionary photos that show a scene with something to describe. */
export const photoSlugs = [
  "namestie",
  "ulica",
  "pasaz",
  "trh",
  "stanok",
  "predajna",
  "pokladnica",
  "kolotoc",
  "park",
  "kaviaren",
  "restauracia",
  "casnik",
  "rodina",
  "dieta",
  "vnuca",
  "vnuk",
  "vecera",
  "kuchyna",
  "obyvacka",
  "skolka",
  "ucitel",
  "profesor",
  "kniznica",
  "muzeum",
  "koncert",
  "vlak",
  "letisko",
  "pristav",
  "dedina",
  "pastier",
  "rybar",
  "turistika",
  "tabor",
  "plaz",
  "lyzovanie",
  "hokej",
  "zaplava",
] as const;

export const interactiveWritingPrompts: WritingPrompt[] = [
  {
    id: "volny-cas",
    slovak: "Opíšte miesto, kde najradšej trávite voľný čas. Prečo sa vám tam páči?",
    english:
      "Describe the place where you most like to spend your free time. Why do you like it there?",
    followUp: {
      slovak: "Ako často tam chodíte a s kým?",
      english: "How often do you go there, and who with?",
    },
  },
  {
    id: "jedlo",
    slovak: "Napíšte o jedle, ktoré máte najradšej. Kedy a s kým ho jete?",
    english: "Write about your favourite food. When and with whom do you eat it?",
    followUp: {
      slovak: "Viete si ho pripraviť? Ako?",
      english: "Can you make it yourself? How?",
    },
  },
  {
    id: "mesto-dedina",
    slovak: "Je lepšie bývať v meste, alebo na dedine? Napíšte svoj názor.",
    english: "Is it better to live in a town or in the countryside? Give your opinion.",
    followUp: {
      slovak: "Čo by ste na mieste, kde bývate, zmenili?",
      english: "What would you change about the place where you live?",
    },
  },
  {
    id: "bezny-den",
    slovak:
      "Opíšte svoj bežný pracovný alebo školský deň. Čo robíte ráno, cez deň a večer?",
    english:
      "Describe an ordinary day at work or school. What do you do in the morning, during the day and in the evening?",
    followUp: {
      slovak: "Ktorá časť dňa je pre vás najpríjemnejšia? Prečo?",
      english: "Which part of the day do you enjoy most? Why?",
    },
  },
  {
    id: "domov",
    slovak: "Opíšte byt alebo dom, v ktorom bývate. Ktoré miesto v ňom máte najradšej?",
    english: "Describe the flat or house you live in. Which spot in it do you like best?",
    followUp: {
      slovak: "Aký by bol váš ideálny domov? Kde by bol a ako by vyzeral?",
      english:
        "What would your ideal home be like? Where would it be, and what would it look like?",
    },
  },
  {
    id: "rocne-obdobie",
    slovak:
      "Ktoré ročné obdobie máte najradšej a prečo? Aké je vtedy počasie tam, kde žijete?",
    english:
      "Which season do you like best, and why? What is the weather like then where you live?",
    followUp: {
      slovak: "Čo vtedy zvyčajne robíte vo voľnom čase?",
      english: "What do you usually do in your free time then?",
    },
  },
  {
    id: "susedia",
    slovak:
      "Poznáte svojich susedov? Napíšte, aké vzťahy máte s ľuďmi, ktorí bývajú vo vašom okolí.",
    english:
      "Do you know your neighbours? Write about how you get on with the people who live near you.",
    followUp: {
      slovak: "Aký by mal byť dobrý sused?",
      english: "What should a good neighbour be like?",
    },
  },
  {
    id: "nakupovanie",
    slovak: "Nakupujete radšej v obchodoch, alebo cez internet? Prečo?",
    english: "Do you prefer to shop in stores or online? Why?",
    followUp: {
      slovak: "Čo by ste si nikdy nekúpili cez internet? Prečo nie?",
      english: "What would you never buy online? Why not?",
    },
  },
  {
    id: "sport",
    slovak:
      "Športujete alebo cvičíte? Napíšte, čo vás baví a ako často sa tomu venujete.",
    english:
      "Do you do any sport or exercise? Write about what you enjoy and how often you do it.",
    followUp: {
      slovak: "Sledujete šport aj v televízii alebo priamo na štadióne? Ktorý?",
      english: "Do you also watch sport on TV or live at a stadium? Which one?",
    },
  },
  {
    id: "doprava",
    slovak: "Ako sa dostávate do práce alebo do školy? Ako dlho vám trvá cesta?",
    english: "How do you get to work or school? How long does the journey take?",
    followUp: {
      slovak: "Čo by pomohlo ľuďom v meste menej jazdiť autom?",
      english: "What would help people in towns drive less?",
    },
  },
  {
    id: "hudba",
    slovak: "Akú hudbu počúvate najčastejšie a kedy?",
    english: "What music do you listen to most, and when?",
    followUp: {
      slovak:
        "Hráte na nejakom hudobnom nástroji? Ak nie, na čom by ste sa chceli naučiť hrať?",
      english:
        "Do you play a musical instrument? If not, what would you like to learn to play?",
    },
  },
  {
    id: "oddych",
    slovak:
      "Ako najradšej oddychujete po náročnom dni? Napíšte, čo robíte a prečo vám to pomáha.",
    english:
      "How do you most like to relax after a hard day? Write what you do and why it helps.",
    followUp: {
      slovak: "Koľko hodín denne spíte? Je to podľa vás dosť?",
      english: "How many hours a day do you sleep? Is that enough, in your view?",
    },
  },
  {
    id: "novy-konicek",
    slovak: "Akému novému koníčku by ste sa chceli venovať? Prečo práve tomuto?",
    english: "What new hobby would you like to take up? Why that one?",
    followUp: {
      slovak: "Čo vám zatiaľ bráni začať?",
      english: "What is stopping you from starting?",
    },
  },
  {
    id: "zoznamovanie",
    slovak:
      "Ako sa zoznamujete s novými ľuďmi? Kde si podľa vás človek najľahšie nájde priateľov?",
    english:
      "How do you meet new people? Where do you think it is easiest to make friends?",
    followUp: {
      slovak:
        "Stretávate sa s priateľmi radšej osobne, alebo si s nimi píšete cez internet?",
      english: "Do you prefer meeting friends in person, or writing to them online?",
    },
  },
  {
    id: "domace-zviera",
    slovak: "Máte doma zviera, alebo by ste nejaké chceli mať? Napíšte o ňom.",
    english: "Do you have a pet, or would you like one? Write about it.",
    followUp: {
      slovak: "Je podľa vás v poriadku chovať veľkého psa v byte? Prečo?",
      english: "Is it all right, in your view, to keep a big dog in a flat? Why?",
    },
  },
];

export const writingSamplePrompts: WritingPrompt[] = [
  {
    id: "dolezity-clovek",
    slovak: "Napíšte o človeku, ktorý je pre vás dôležitý. Kto to je a prečo?",
    english: "Write about a person who is important to you. Who are they, and why?",
  },
  {
    id: "preco-slovencina",
    slovak: "Prečo sa učíte slovenčinu? Čo vás na nej baví a čo je pre vás ťažké?",
    english:
      "Why are you learning Slovak? What do you enjoy about it, and what do you find hard?",
  },
  {
    id: "idealny-vikend",
    slovak: "Opíšte svoj ideálny víkend. Čo by ste robili a s kým?",
    english: "Describe your ideal weekend. What would you do, and who with?",
  },
  {
    id: "zivotne-prostredie",
    slovak:
      "Čo môže každý z nás urobiť pre životné prostredie? Napíšte, čo robíte vy a čo by mali robiť firmy a štát.",
    english:
      "What can each of us do for the environment? Write about what you do, and what companies and the state should do.",
  },
  {
    id: "turizmus",
    slovak:
      "Prináša turizmus mestám viac výhod, alebo viac problémov? Napíšte svoj názor a uveďte príklady.",
    english:
      "Does tourism bring towns more benefits or more problems? Give your opinion with examples.",
  },
  {
    id: "skola",
    slovak:
      "Čo by sa deti mali učiť v škole, čo sa tam dnes neučia? Prečo je to podľa vás dôležité?",
    english:
      "What should children learn at school that they don't learn there today? Why do you think it matters?",
  },
  {
    id: "o-pat-rokov",
    slovak:
      "Ako si predstavujete svoj život o päť rokov? Napíšte o svojich plánoch a želaniach.",
    english:
      "How do you picture your life in five years? Write about your plans and wishes.",
  },
  {
    id: "generacie",
    slovak:
      "Čo sa môžu mladí ľudia naučiť od starších a čo starší od mladých? Uveďte príklady.",
    english:
      "What can young people learn from older people, and older people from the young? Give examples.",
  },
  {
    id: "deti-a-mobily",
    slovak:
      "Od akého veku by mali deti mať vlastný mobilný telefón? Napíšte svoj názor a vysvetlite ho.",
    english:
      "From what age should children have their own mobile phone? Give your opinion and explain it.",
  },
  {
    id: "reklama",
    slovak:
      "Aký vplyv má reklama na ľudí? Napíšte, kde sa s ňou stretávate a čo si o nej myslíte.",
    english:
      "How does advertising affect people? Write about where you come across it and what you think of it.",
  },
  {
    id: "dobrovolnictvo",
    slovak:
      "Prečo ľudia pomáhajú druhým ako dobrovoľníci? Mal by to podľa vás aspoň raz skúsiť každý?",
    english:
      "Why do people help others as volunteers? Should everyone try it at least once, in your view?",
  },
  {
    id: "zivot-v-zahranici",
    slovak:
      "Keby ste mali rok žiť v inej krajine, ktorú by ste si vybrali? Čo by vám z domova chýbalo?",
    english:
      "If you were to live in another country for a year, which one would you choose? What would you miss from home?",
  },
  {
    id: "kultura-zadarmo",
    slovak: "Mali by byť múzeá, galérie a divadlá zadarmo? Napíšte argumenty za a proti.",
    english:
      "Should museums, galleries and theatres be free? Give arguments for and against.",
  },
  {
    id: "spravy",
    slovak:
      "Odkiaľ sa dozvedáte, čo sa deje vo svete? Ako zistíte, či je informácia na internete pravdivá?",
    english:
      "Where do you find out what is going on in the world? How do you tell whether information online is true?",
  },
  {
    id: "dochvilnost",
    slovak:
      "Chodíte všade načas, alebo občas meškáte? Je dochvíľnosť v rôznych krajinách rovnako dôležitá?",
    english:
      "Are you always on time, or are you sometimes late? Is punctuality equally important in different countries?",
  },
];

export const readThenSpeakPrompts: SpeakingPrompt[] = [
  {
    id: "moje-mesto",
    slovak: "Porozprávajte nám o meste alebo dedine, kde bývate.",
    english: "Tell us about the town or village where you live.",
    points: [
      { slovak: "Kde sa nachádza?", english: "Where is it?" },
      { slovak: "Čo sa tam dá robiť?", english: "What can you do there?" },
      {
        slovak: "Čo sa vám tam páči a čo nie?",
        english: "What do you like there, and what not?",
      },
    ],
  },
  {
    id: "kniha-film",
    slovak: "Porozprávajte nám o svojej obľúbenej knihe alebo o svojom obľúbenom filme.",
    english: "Tell us about your favourite book or film.",
    points: [
      { slovak: "O čom je?", english: "What is it about?" },
      { slovak: "Prečo sa vám páči?", english: "Why do you like it?" },
      { slovak: "Komu by ste to odporučili?", english: "Who would you recommend it to?" },
    ],
  },
  {
    id: "sviatok",
    slovak: "Porozprávajte nám o sviatku, ktorý oslavujete.",
    english: "Tell us about a holiday or festival you celebrate.",
    points: [
      { slovak: "Kedy je?", english: "When is it?" },
      { slovak: "Čo v ten deň robíte?", english: "What do you do on that day?" },
      { slovak: "S kým ho oslavujete?", english: "Who do you celebrate it with?" },
    ],
  },
  {
    id: "praca-alebo-skola",
    slovak: "Porozprávajte nám o svojej práci alebo o svojom štúdiu.",
    english: "Tell us about your work or your studies.",
    points: [
      { slovak: "Čo presne robíte?", english: "What exactly do you do?" },
      { slovak: "Čo vás na tom baví?", english: "What do you enjoy about it?" },
      { slovak: "Čo je pre vás náročné?", english: "What do you find demanding?" },
    ],
  },
  {
    id: "domace-prace",
    slovak: "Porozprávajte nám o domácich prácach.",
    english: "Tell us about the housework you do.",
    points: [
      {
        slovak: "Ktoré práce robíte najčastejšie?",
        english: "Which jobs do you do most often?",
      },
      { slovak: "Ktorá vás baví najmenej?", english: "Which one do you enjoy least?" },
      { slovak: "Pomáha vám s nimi niekto?", english: "Does anyone help you with them?" },
    ],
  },
  {
    id: "hracka-z-detstva",
    slovak:
      "Porozprávajte nám o hračke alebo hre z detstva, na ktorú si dodnes spomínate.",
    english: "Tell us about a toy or game from your childhood that you still remember.",
    points: [
      { slovak: "Čo to je?", english: "What is it?" },
      {
        slovak: "Prečo si na ňu dodnes spomínate?",
        english: "Why do you still remember it?",
      },
      { slovak: "Poznajú ju aj dnešné deti?", english: "Do children today know it too?" },
    ],
  },
  {
    id: "obliekanie",
    slovak: "Porozprávajte nám o tom, ako sa obliekate.",
    english: "Tell us about the way you dress.",
    points: [
      { slovak: "Čo nosíte najčastejšie?", english: "What do you wear most often?" },
      {
        slovak: "Obliekate sa do práce inak ako vo voľnom čase?",
        english: "Do you dress differently for work than in your free time?",
      },
      { slovak: "Je pre vás móda dôležitá?", english: "Is fashion important to you?" },
    ],
  },
  {
    id: "rastliny",
    slovak: "Porozprávajte nám o rastlinách, ktoré máte doma alebo v záhrade.",
    english: "Tell us about the plants you have at home or in a garden.",
    points: [
      { slovak: "Aké rastliny to sú?", english: "What plants are they?" },
      { slovak: "Kto sa o ne stará?", english: "Who looks after them?" },
      {
        slovak: "Ak žiadne nemáte, aké by ste chceli mať?",
        english: "If you have none, which would you like to have?",
      },
    ],
  },
  {
    id: "fotografia",
    slovak: "Porozprávajte nám o fotografii, ktorá je pre vás dôležitá.",
    english: "Tell us about a photo that matters to you.",
    points: [
      { slovak: "Čo alebo kto je na nej?", english: "What or who is in it?" },
      { slovak: "Kde ju máte?", english: "Where do you keep it?" },
      {
        slovak: "Čo vám tá fotografia pripomína?",
        english: "What does the photo remind you of?",
      },
    ],
  },
  {
    id: "darcek",
    slovak: "Porozprávajte nám o darčeku, ktorý by ste chceli dať niekomu blízkemu.",
    english: "Tell us about a present you would like to give someone close to you.",
    points: [
      { slovak: "Čo by to bolo?", english: "What would it be?" },
      { slovak: "Komu by ste ho dali?", english: "Who would you give it to?" },
      { slovak: "Prečo práve tento darček?", english: "Why that present in particular?" },
    ],
  },
  {
    id: "navsteva",
    slovak: "Porozprávajte nám o tom, ako u vás vyzerá návšteva priateľov alebo rodiny.",
    english: "Tell us what a visit from friends or family is like at your place.",
    points: [
      {
        slovak: "Ako často k vám chodia hostia?",
        english: "How often do guests come to you?",
      },
      { slovak: "Čo im ponúkate?", english: "What do you offer them?" },
      {
        slovak: "Chodíte radšej na návštevy, alebo máte radšej hostí doma?",
        english: "Do you prefer visiting others, or having guests at home?",
      },
    ],
  },
  {
    id: "zdravie",
    slovak: "Porozprávajte nám o tom, čo robíte, keď vám nie je dobre.",
    english: "Tell us what you do when you don't feel well.",
    points: [
      {
        slovak: "Chodíte hneď k lekárovi?",
        english: "Do you go to the doctor straight away?",
      },
      {
        slovak: "Čo vám pomáha, keď vás bolí hlava alebo hrdlo?",
        english: "What helps you when you have a headache or a sore throat?",
      },
      { slovak: "Kto sa o vás vtedy stará?", english: "Who looks after you then?" },
    ],
  },
];

export const speakingSamplePrompts: SpeakingPrompt[] = [
  {
    id: "jazyk-online",
    slovak: "Aké sú výhody a nevýhody učenia sa jazyka online? Povedzte svoj názor.",
    english:
      "What are the pros and cons of learning a language online? Give your opinion.",
  },
  {
    id: "cesta",
    slovak: "Porozprávajte nám o ceste, na ktorú dodnes s radosťou spomínate.",
    english: "Talk about a trip you still like to remember.",
  },
  {
    id: "milion-eur",
    slovak:
      "Čo by ste urobili, keby ste dostali milión eur? Porozprávajte nám o svojich plánoch.",
    english:
      "What would you do if you were given a million euros? Tell us about your plans.",
  },
  {
    id: "vecera-s-osobnostou",
    slovak:
      "Keby ste mohli ísť na večeru s akoukoľvek známou osobnosťou, koho by ste si vybrali? O čom by ste sa rozprávali?",
    english:
      "If you could have dinner with any famous person, who would you choose? What would you talk about?",
  },
  {
    id: "cestovanie-v-case",
    slovak:
      "Keby ste mohli cestovať v čase, vybrali by ste sa do minulosti, alebo do budúcnosti? Kam presne a prečo?",
    english:
      "If you could travel in time, would you go to the past or to the future? Where exactly, and why?",
  },
  {
    id: "humor",
    slovak:
      "Čo vás dokáže rozosmiať? Myslíte si, že sa ľudia v rôznych krajinách smejú na tých istých veciach?",
    english:
      "What makes you laugh? Do you think people in different countries laugh at the same things?",
  },
  {
    id: "nove-pravidlo",
    slovak:
      "Keby ste mohli zaviesť jedno nové pravidlo, ktoré by platilo pre všetkých, aké by to bolo? Prečo?",
    english:
      "If you could introduce one new rule that applied to everyone, what would it be? Why?",
  },
  {
    id: "vynalez",
    slovak: "Ktorý vynález je podľa vás najdôležitejší? Ako by vyzeral život bez neho?",
    english:
      "Which invention do you think is the most important? What would life be like without it?",
  },
  {
    id: "stastie",
    slovak: "Čo podľa vás robí človeka šťastným? Povedzte svoj názor a uveďte príklady.",
    english: "What do you think makes a person happy? Give your opinion with examples.",
  },
  {
    id: "umela-inteligencia",
    slovak:
      "Ako umelá inteligencia mení prácu a vzdelávanie? Povedzte svoj názor a uveďte príklady.",
    english:
      "How is artificial intelligence changing work and education? Give your opinion with examples.",
  },
  {
    id: "vesmir",
    slovak:
      "Majú lety do vesmíru zmysel, keď máme toľko problémov na Zemi? Povedzte svoj názor.",
    english:
      "Does space travel make sense when we have so many problems on Earth? Give your opinion.",
  },
  {
    id: "pravda",
    slovak:
      "Je niekedy v poriadku nepovedať celú pravdu? Vysvetlite svoj názor na príkladoch.",
    english:
      "Is it ever all right not to tell the whole truth? Explain your view with examples.",
  },
];
