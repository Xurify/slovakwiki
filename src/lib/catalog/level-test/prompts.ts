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
    level: "A2",
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
    level: "A2",
    slovak: "Napíšte o jedle, ktoré máte najradšej. Kedy a s kým ho jete?",
    english: "Write about your favourite food. When and with whom do you eat it?",
    followUp: {
      slovak: "Viete si ho pripraviť? Ako?",
      english: "Can you make it yourself? How?",
    },
  },
  {
    id: "mesto-dedina",
    level: "B1",
    slovak: "Je lepšie bývať v meste, alebo na dedine? Napíšte svoj názor.",
    english: "Is it better to live in a town or in the countryside? Give your opinion.",
    followUp: {
      slovak: "Čo by ste na mieste, kde bývate, zmenili?",
      english: "What would you change about the place where you live?",
    },
  },
  {
    id: "bezny-den",
    level: "A2",
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
    level: "A2",
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
    level: "A2",
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
    level: "B1",
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
    level: "B1",
    slovak: "Nakupujete radšej v obchodoch, alebo cez internet? Prečo?",
    english: "Do you prefer to shop in stores or online? Why?",
    followUp: {
      slovak: "Čo by ste si nikdy nekúpili cez internet? Prečo nie?",
      english: "What would you never buy online? Why not?",
    },
  },
  {
    id: "sport",
    level: "A2",
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
    level: "B1",
    slovak: "Ako sa dostávate do práce alebo do školy? Ako dlho vám trvá cesta?",
    english: "How do you get to work or school? How long does the journey take?",
    followUp: {
      slovak: "Čo by pomohlo ľuďom v meste menej jazdiť autom?",
      english: "What would help people in towns drive less?",
    },
  },
  {
    id: "hudba",
    level: "A2",
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
    level: "A2",
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
    level: "B1",
    slovak: "Akému novému koníčku by ste sa chceli venovať? Prečo práve tomuto?",
    english: "What new hobby would you like to take up? Why that one?",
    followUp: {
      slovak: "Čo vám zatiaľ bráni začať?",
      english: "What is stopping you from starting?",
    },
  },
  {
    id: "zoznamovanie",
    level: "B1",
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
    level: "B1",
    slovak: "Máte doma zviera, alebo by ste nejaké chceli mať? Napíšte o ňom.",
    english: "Do you have a pet, or would you like one? Write about it.",
    followUp: {
      slovak: "Je podľa vás v poriadku chovať veľkého psa v byte? Prečo?",
      english: "Is it all right, in your view, to keep a big dog in a flat? Why?",
    },
  },
  {
    id: "praca-z-domu",
    level: "B2",
    slovak: "Pracovať z domu, alebo v kancelárii? Napíšte, čo vám vyhovuje viac a prečo.",
    english: "Working from home or in an office? Write which suits you better, and why.",
    followUp: {
      slovak: "Aké pravidlá by mali mať firmy pre prácu z domu?",
      english: "What rules should companies have for working from home?",
    },
  },
  {
    id: "doprava-zadarmo",
    level: "B2",
    slovak: "Mala by byť mestská hromadná doprava zadarmo? Napíšte svoj názor.",
    english: "Should public transport in towns be free? Give your opinion.",
    followUp: {
      slovak: "Kto by ju mal podľa vás zaplatiť?",
      english: "Who do you think should pay for it?",
    },
  },
  {
    id: "socialne-siete",
    level: "B2",
    slovak:
      "Ako menia sociálne siete vzťahy medzi ľuďmi? Napíšte svoj názor a uveďte príklad.",
    english:
      "How are social networks changing relationships between people? Give your opinion and an example.",
    followUp: {
      slovak: "Koľko času na nich trávite vy? Chceli by ste to zmeniť?",
      english: "How much time do you spend on them? Would you like to change that?",
    },
  },
  {
    id: "skolske-obedy",
    level: "B2",
    slovak:
      "Kto by mal rozhodovať o tom, čo deti jedia v škole: rodičia, alebo škola? Napíšte svoj názor.",
    english:
      "Who should decide what children eat at school: parents or the school? Give your opinion.",
    followUp: {
      slovak: "Čo by ste na školských jedálňach zmenili?",
      english: "What would you change about school canteens?",
    },
  },
  {
    id: "tradicie",
    level: "C1",
    slovak:
      "Majú tradície v modernej spoločnosti ešte zmysel, alebo nás skôr obmedzujú? Zdôvodnite svoj názor.",
    english:
      "Do traditions still make sense in modern society, or do they rather hold us back? Give reasons for your view.",
    followUp: {
      slovak: "Ktorú tradíciu by ste zachovali za každú cenu a prečo?",
      english: "Which tradition would you keep at all costs, and why?",
    },
  },
  {
    id: "uspech",
    level: "C1",
    slovak: "Čo podľa vás znamená úspech? Závisí viac od talentu, alebo od vytrvalosti?",
    english:
      "What does success mean to you? Does it depend more on talent or on perseverance?",
    followUp: {
      slovak: "Čo by bol úspech pre vás osobne?",
      english: "What would success be for you personally?",
    },
  },
  {
    id: "anonymita",
    level: "C1",
    slovak:
      "Mala by byť anonymita na internete chránená, alebo by mal každý vystupovať pod vlastným menom? Zvážte výhody aj riziká.",
    english:
      "Should anonymity on the internet be protected, or should everyone appear under their own name? Weigh the benefits and the risks.",
    followUp: {
      slovak: "Ako by sa podľa vás dalo bojovať proti nenávistným komentárom?",
      english: "How do you think hateful comments could be tackled?",
    },
  },
];

export const writingSamplePrompts: WritingPrompt[] = [
  {
    id: "dolezity-clovek",
    level: "A2",
    slovak: "Napíšte o človeku, ktorý je pre vás dôležitý. Kto to je a prečo?",
    english: "Write about a person who is important to you. Who are they, and why?",
  },
  {
    id: "preco-slovencina",
    level: "A2",
    slovak: "Prečo sa učíte slovenčinu? Čo vás na nej baví a čo je pre vás ťažké?",
    english:
      "Why are you learning Slovak? What do you enjoy about it, and what do you find hard?",
  },
  {
    id: "idealny-vikend",
    level: "A2",
    slovak: "Opíšte svoj ideálny víkend. Čo by ste robili a s kým?",
    english: "Describe your ideal weekend. What would you do, and who with?",
  },
  {
    id: "zivotne-prostredie",
    level: "B2",
    slovak:
      "Čo môže každý z nás urobiť pre životné prostredie? Napíšte, čo robíte vy a čo by mali robiť firmy a štát.",
    english:
      "What can each of us do for the environment? Write about what you do, and what companies and the state should do.",
  },
  {
    id: "turizmus",
    level: "B2",
    slovak:
      "Prináša turizmus mestám viac výhod, alebo viac problémov? Napíšte svoj názor a uveďte príklady.",
    english:
      "Does tourism bring towns more benefits or more problems? Give your opinion with examples.",
  },
  {
    id: "skola",
    level: "B1",
    slovak:
      "Čo by sa deti mali učiť v škole, čo sa tam dnes neučia? Prečo je to podľa vás dôležité?",
    english:
      "What should children learn at school that they don't learn there today? Why do you think it matters?",
  },
  {
    id: "o-pat-rokov",
    level: "B1",
    slovak:
      "Ako si predstavujete svoj život o päť rokov? Napíšte o svojich plánoch a želaniach.",
    english:
      "How do you picture your life in five years? Write about your plans and wishes.",
  },
  {
    id: "generacie",
    level: "B2",
    slovak:
      "Čo sa môžu mladí ľudia naučiť od starších a čo starší od mladých? Uveďte príklady.",
    english:
      "What can young people learn from older people, and older people from the young? Give examples.",
  },
  {
    id: "deti-a-mobily",
    level: "B1",
    slovak:
      "Od akého veku by mali deti mať vlastný mobilný telefón? Napíšte svoj názor a vysvetlite ho.",
    english:
      "From what age should children have their own mobile phone? Give your opinion and explain it.",
  },
  {
    id: "reklama",
    level: "B2",
    slovak:
      "Aký vplyv má reklama na ľudí? Napíšte, kde sa s ňou stretávate a čo si o nej myslíte.",
    english:
      "How does advertising affect people? Write about where you come across it and what you think of it.",
  },
  {
    id: "dobrovolnictvo",
    level: "B2",
    slovak:
      "Prečo ľudia pomáhajú druhým ako dobrovoľníci? Mal by to podľa vás aspoň raz skúsiť každý?",
    english:
      "Why do people help others as volunteers? Should everyone try it at least once, in your view?",
  },
  {
    id: "zivot-v-zahranici",
    level: "B1",
    slovak:
      "Keby ste mali rok žiť v inej krajine, ktorú by ste si vybrali? Čo by vám z domova chýbalo?",
    english:
      "If you were to live in another country for a year, which one would you choose? What would you miss from home?",
  },
  {
    id: "kultura-zadarmo",
    level: "B2",
    slovak: "Mali by byť múzeá, galérie a divadlá zadarmo? Napíšte argumenty za a proti.",
    english:
      "Should museums, galleries and theatres be free? Give arguments for and against.",
  },
  {
    id: "spravy",
    level: "B2",
    slovak:
      "Odkiaľ sa dozvedáte, čo sa deje vo svete? Ako zistíte, či je informácia na internete pravdivá?",
    english:
      "Where do you find out what is going on in the world? How do you tell whether information online is true?",
  },
  {
    id: "dochvilnost",
    level: "B1",
    slovak:
      "Chodíte všade načas, alebo občas meškáte? Je dochvíľnosť v rôznych krajinách rovnako dôležitá?",
    english:
      "Are you always on time, or are you sometimes late? Is punctuality equally important in different countries?",
  },
  {
    id: "spomienka-z-detstva",
    level: "B1",
    slovak:
      "Napíšte o príjemnej spomienke z detstva. Čo sa stalo a prečo si ju pamätáte?",
    english:
      "Write about a happy memory from your childhood. What happened, and why do you remember it?",
  },
  {
    id: "jazyk-a-myslenie",
    level: "C1",
    slovak:
      "Do akej miery formuje jazyk, ktorým hovoríme, náš spôsob myslenia? Uveďte príklady zo svojej skúsenosti.",
    english:
      "To what extent does the language we speak shape the way we think? Give examples from your own experience.",
  },
  {
    id: "zakladny-prijem",
    level: "C1",
    slovak:
      "Mal by štát zaviesť základný príjem pre všetkých, ak stroje nahradia veľkú časť práce? Zvážte argumenty za aj proti.",
    english:
      "Should the state introduce a basic income for everyone if machines replace a large share of work? Weigh the arguments for and against.",
  },
  {
    id: "pamatniky",
    level: "C1",
    slovak:
      "Mali by mestá odstraňovať pamätníky osobností, ktorých činy dnes hodnotíme negatívne? Zdôvodnite svoj postoj.",
    english:
      "Should towns remove monuments to figures whose actions we now judge negatively? Give reasons for your position.",
  },
];

export const readThenSpeakPrompts: SpeakingPrompt[] = [
  {
    id: "moje-mesto",
    level: "A2",
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
    level: "B1",
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
    level: "A2",
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
    level: "A2",
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
    level: "A2",
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
    level: "B1",
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
    level: "A2",
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
    level: "A2",
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
    level: "B1",
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
    level: "B1",
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
    level: "B1",
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
    level: "A2",
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
  {
    id: "praca-o-desat-rokov",
    level: "B2",
    slovak: "Porozprávajte nám o práci, ktorú by ste chceli robiť o desať rokov.",
    english: "Tell us about the job you would like to be doing in ten years.",
    points: [
      { slovak: "Čo presne by ste robili?", english: "What exactly would you do?" },
      { slovak: "Čo vás na tom láka?", english: "What attracts you to it?" },
      {
        slovak: "Čo pre to musíte urobiť?",
        english: "What do you need to do to get there?",
      },
    ],
  },
  {
    id: "dolezite-rozhodnutie",
    level: "B2",
    slovak: "Porozprávajte nám o rozhodnutí, ktoré zmenilo váš život.",
    english: "Tell us about a decision that changed your life.",
    points: [
      { slovak: "Aké to bolo rozhodnutie?", english: "What was the decision?" },
      { slovak: "Čo vám pomohlo rozhodnúť sa?", english: "What helped you decide?" },
      {
        slovak: "Čo by ste dnes urobili inak?",
        english: "What would you do differently today?",
      },
    ],
  },
  {
    id: "miesto-na-zivot",
    level: "B2",
    slovak: "Porozprávajte nám o krajine alebo meste, kde by ste chceli žiť.",
    english: "Tell us about a country or city where you would like to live.",
    points: [
      { slovak: "Prečo práve tam?", english: "Why there in particular?" },
      { slovak: "Čo by vám tam chýbalo?", english: "What would you miss there?" },
      {
        slovak: "Aké prekážky by ste museli prekonať?",
        english: "What obstacles would you have to overcome?",
      },
    ],
  },
  {
    id: "verejna-diskusia",
    level: "C1",
    slovak:
      "Porozprávajte nám o téme, o ktorej sa vo vašej krajine v poslednom čase veľa diskutuje.",
    english:
      "Tell us about a topic that has been widely debated in your country recently.",
    points: [
      { slovak: "O čo v spore ide?", english: "What is the dispute about?" },
      {
        slovak: "Aké sú hlavné argumenty oboch strán?",
        english: "What are the main arguments on each side?",
      },
      {
        slovak: "Aký postoj zastávate vy a prečo?",
        english: "What position do you take, and why?",
      },
    ],
  },
  {
    id: "pohlad-na-svet",
    level: "C1",
    slovak: "Porozprávajte nám o človeku, ktorý ovplyvnil váš pohľad na svet.",
    english: "Tell us about a person who influenced the way you see the world.",
    points: [
      {
        slovak: "Kto to je a ako ste sa spoznali?",
        english: "Who is it, and how did you meet?",
      },
      {
        slovak: "Čo konkrétne ste sa od tohto človeka naučili?",
        english: "What exactly did you learn from this person?",
      },
      { slovak: "V čom sa vaše názory líšia?", english: "Where do your views differ?" },
    ],
  },
];

export const speakingSamplePrompts: SpeakingPrompt[] = [
  {
    id: "jazyk-online",
    level: "B1",
    slovak: "Aké sú výhody a nevýhody učenia sa jazyka online? Povedzte svoj názor.",
    english:
      "What are the pros and cons of learning a language online? Give your opinion.",
  },
  {
    id: "cesta",
    level: "B1",
    slovak: "Porozprávajte nám o ceste, na ktorú dodnes s radosťou spomínate.",
    english: "Talk about a trip you still like to remember.",
  },
  {
    id: "milion-eur",
    level: "B1",
    slovak:
      "Čo by ste urobili, keby ste dostali milión eur? Porozprávajte nám o svojich plánoch.",
    english:
      "What would you do if you were given a million euros? Tell us about your plans.",
  },
  {
    id: "vecera-s-osobnostou",
    level: "B1",
    slovak:
      "Keby ste mohli ísť na večeru s akoukoľvek známou osobnosťou, koho by ste si vybrali? O čom by ste sa rozprávali?",
    english:
      "If you could have dinner with any famous person, who would you choose? What would you talk about?",
  },
  {
    id: "cestovanie-v-case",
    level: "B2",
    slovak:
      "Keby ste mohli cestovať v čase, vybrali by ste sa do minulosti, alebo do budúcnosti? Kam presne a prečo?",
    english:
      "If you could travel in time, would you go to the past or to the future? Where exactly, and why?",
  },
  {
    id: "humor",
    level: "B2",
    slovak:
      "Čo vás dokáže rozosmiať? Myslíte si, že sa ľudia v rôznych krajinách smejú na tých istých veciach?",
    english:
      "What makes you laugh? Do you think people in different countries laugh at the same things?",
  },
  {
    id: "nove-pravidlo",
    level: "B2",
    slovak:
      "Keby ste mohli zaviesť jedno nové pravidlo, ktoré by platilo pre všetkých, aké by to bolo? Prečo?",
    english:
      "If you could introduce one new rule that applied to everyone, what would it be? Why?",
  },
  {
    id: "vynalez",
    level: "B2",
    slovak: "Ktorý vynález je podľa vás najdôležitejší? Ako by vyzeral život bez neho?",
    english:
      "Which invention do you think is the most important? What would life be like without it?",
  },
  {
    id: "stastie",
    level: "B2",
    slovak: "Čo podľa vás robí človeka šťastným? Povedzte svoj názor a uveďte príklady.",
    english: "What do you think makes a person happy? Give your opinion with examples.",
  },
  {
    id: "umela-inteligencia",
    level: "C1",
    slovak:
      "Ako umelá inteligencia mení prácu a vzdelávanie? Povedzte svoj názor a uveďte príklady.",
    english:
      "How is artificial intelligence changing work and education? Give your opinion with examples.",
  },
  {
    id: "vesmir",
    level: "C1",
    slovak:
      "Majú lety do vesmíru zmysel, keď máme toľko problémov na Zemi? Povedzte svoj názor.",
    english:
      "Does space travel make sense when we have so many problems on Earth? Give your opinion.",
  },
  {
    id: "pravda",
    level: "C1",
    slovak:
      "Je niekedy v poriadku nepovedať celú pravdu? Vysvetlite svoj názor na príkladoch.",
    english:
      "Is it ever all right not to tell the whole truth? Explain your view with examples.",
  },
  {
    id: "o-rodine",
    level: "A2",
    slovak:
      "Porozprávajte nám o svojej rodine. Kto patrí do vašej rodiny a čo radi robíte spolu?",
    english:
      "Tell us about your family. Who is in your family, and what do you like doing together?",
  },
  {
    id: "miesto-v-meste",
    level: "A2",
    slovak: "Porozprávajte nám o mieste vo vašom meste, kam radi chodíte.",
    english: "Tell us about a place in your town that you like going to.",
  },
  {
    id: "bezny-vikend",
    level: "A2",
    slovak: "Čo zvyčajne robíte cez víkend? Porozprávajte nám o tom.",
    english: "What do you usually do at the weekend? Tell us about it.",
  },
  {
    id: "dobra-rada",
    level: "B1",
    slovak: "Akú najlepšiu radu ste kedy dostali? Ako vám pomohla?",
    english:
      "What is the best piece of advice you have ever been given? How did it help you?",
  },
];
