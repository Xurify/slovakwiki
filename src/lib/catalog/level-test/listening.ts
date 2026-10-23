import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { CefrLevel } from "$lib/level-test/scale";
import type { ListenCompleteQuestion } from "$lib/level-test/types";

/**
 * Interactive Listening scenarios. The narrator reads the scenario, the
 * partner speaks each turn in their own lesson voice, and the learner picks a
 * reply. Reply options avoid past-tense forms so they fit any speaker's gender.
 */
export interface AuthoredLine {
  text: string;
  english: string;
}

export interface AuthoredListeningSet {
  id: string;
  level: CefrLevel;
  partner: LessonCharacterId;
  partnerName: string;
  scenario: AuthoredLine;
  complete: ListenCompleteQuestion[];
  turns: { line: AuthoredLine; options: string[]; answer: number }[];
  summaryKey: string[];
}

export const LISTENING_NARRATOR: LessonCharacterId = "narrator";

export const listeningSets: AuthoredListeningSet[] = [
  {
    id: "ucenie-s-marekom",
    level: "A2",
    partner: "marek",
    partnerName: "Marek",
    scenario: {
      text: "Študuješ na univerzite v Bratislave. Volá ti tvoj spolužiak Marek. Budúci týždeň máte skúšku z histórie a Marek sa chce s tebou učiť.",
      english:
        "You study at a university in Bratislava. Your classmate Marek is calling you. Next week you have a history exam, and Marek wants to study with you.",
    },
    complete: [
      {
        before: "Marek je tvoj",
        after: ".",
        english: "Marek is your ___.",
        accepted: ["spolužiak"],
      },
      {
        before: "Budúci týždeň máte skúšku z",
        after: ".",
        english: "Next week you have an exam in ___.",
        accepted: ["histórie", "dejín"],
      },
      {
        before: "Marek sa chce s tebou",
        after: ".",
        english: "Marek wants to ___ with you.",
        accepted: ["učiť", "spolu učiť"],
      },
    ],
    turns: [
      {
        line: {
          text: "Ahoj! Máš chvíľu? Chcem sa ťa niečo opýtať.",
          english: "Hi! Have you got a minute? I want to ask you something.",
        },
        options: [
          "Dobrý deň, pán profesor.",
          "Ahoj, jasné. O čo ide?",
          "Ďakujem, nemám hlad.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Nechceš sa so mnou učiť na skúšku z histórie?",
          english: "Do you want to study for the history exam with me?",
        },
        options: [
          "Jasné, to je dobrý nápad. Kedy máš čas?",
          "Skúška je z histórie.",
          "Nie, dnes je pekné počasie.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Mne by sa hodila streda popoludní. Čo ty?",
          english: "Wednesday afternoon would suit me. What about you?",
        },
        options: [
          "Streda je tretí deň v týždni.",
          "Popoludní je vonku teplo.",
          "V stredu nemôžem, ale vo štvrtok popoludní mám čas.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Dobre, tak vo štvrtok. Môžeme sa stretnúť v knižnici?",
          english: "OK, Thursday then. Can we meet in the library?",
        },
        options: [
          "Áno, v knižnici je ticho. To je dobrý nápad.",
          "Knihy sú na poličke.",
          "Štvrtok je po strede.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Super. Prinesieš aj svoje poznámky z prednášok?",
          english: "Great. Will you bring your lecture notes too?",
        },
        options: [
          "Poznámky sú v kine.",
          "Jasné, prinesiem ich.",
          "Prednášky sú každý deň.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Tak sa uvidíme vo štvrtok o druhej. Maj sa!",
          english: "See you on Thursday at two, then. Bye!",
        },
        options: [
          "Dobrú noc, pani učiteľka.",
          "Prepáč, neviem, kde je štvrtok.",
          "Dobre, uvidíme sa. Ahoj!",
        ],
        answer: 2,
      },
    ],
    summaryKey: [
      "Marek chce, aby sa spolu učili na skúšku z histórie.",
      "V stredu to nejde, stretnú sa vo štvrtok o druhej popoludní.",
      "Stretnú sa v knižnici.",
      "Študent prinesie poznámky z prednášok.",
    ],
  },
  {
    id: "nahradny-test",
    level: "B1",
    partner: "maria",
    partnerName: "Mária",
    scenario: {
      text: "Navštevuješ kurz slovenčiny v jazykovej škole. Minulý týždeň bol test, ale pre chorobu ťa v škole nebolo. Ideš do kancelárie za pani Máriou, ktorá v škole rieši termíny. Chceš sa s ňou dohodnúť na náhradnom termíne.",
      english:
        "You attend a Slovak course at a language school. There was a test last week, but you were off sick. You go to the office to see Mária, who handles dates at the school. You want to agree on a make-up date with her.",
    },
    complete: [
      {
        before: "Navštevuješ kurz",
        after: "v jazykovej škole.",
        english: "You attend a ___ course at a language school.",
        accepted: ["slovenčiny", "slovenského jazyka"],
      },
      {
        before: "Minulý týždeň bol",
        after: ", ale v škole ťa nebolo.",
        english: "Last week there was a ___, but you were not at school.",
        accepted: ["test"],
      },
      {
        before: "Chceš sa dohodnúť na náhradnom",
        after: ".",
        english: "You want to agree on a make-up ___.",
        accepted: ["termíne"],
      },
    ],
    turns: [
      {
        line: {
          text: "Dobrý deň. Potrebujete niečo?",
          english: "Hello. Do you need something?",
        },
        options: [
          "Ahoj, čo robíš?",
          "Dobrý deň. Môžem sa vás niečo opýtať?",
          "Dovidenia, pani Mária.",
        ],
        answer: 1,
      },
      {
        line: { text: "Samozrejme. O čo ide?", english: "Of course. What is it about?" },
        options: [
          "Minulý týždeň ma nebolo na teste, lebo mi nebolo dobre.",
          "Test bol veľmi ľahký, ďakujem.",
          "Ide o počasie, vonku prší.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Aha, rozumiem. Test si môžete napísať v piatok ráno alebo v pondelok popoludní.",
          english:
            "I see. You can take the test on Friday morning or on Monday afternoon.",
        },
        options: [
          "Ráno zvyčajne raňajkujem.",
          "Ďakujem, test sa mi veľmi páčil.",
          "Piatok ráno mi vyhovuje viac.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Dobre. Je to v miestnosti číslo dvanásť, o ôsmej. Budete potrebovať aj slovník?",
          english:
            "Good. It is in room twelve, at eight. Will you need a dictionary too?",
        },
        options: [
          "Dvanásť plus osem je dvadsať.",
          "Nie, slovník nepotrebujem, ďakujem.",
          "Áno, miestnosť je veľmi pekná.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Ešte niečo. Prineste si, prosím, aj potvrdenie od lekára.",
          english: "One more thing. Please bring a doctor's note as well.",
        },
        options: [
          "Lekár je môj brat.",
          "Nie, lekára nepotrebujem.",
          "Dobre, prinesiem ho.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Tak sa uvidíme v piatok. Dovidenia.",
          english: "See you on Friday, then. Goodbye.",
        },
        options: ["Ďakujem, dovidenia.", "Ahoj, maj sa!", "Uvidíme sa zajtra večer."],
        answer: 0,
      },
    ],
    summaryKey: [
      "Študent nebol na teste, lebo bol chorý.",
      "Test si napíše v piatok ráno o ôsmej v miestnosti dvanásť.",
      "Slovník nepotrebuje.",
      "Musí priniesť potvrdenie od lekára.",
    ],
  },
  {
    id: "objednavka-k-lekarke",
    level: "A2",
    partner: "receptionist",
    partnerName: "Zuzana",
    scenario: {
      text: "Už tri dni ťa bolí hrdlo a máš horúčku. Voláš do ambulancie doktorky Kováčovej, lebo sa chceš objednať na vyšetrenie. Telefón zdvihne sestra Zuzana.",
      english:
        "Your throat has been sore for three days and you have a fever. You call Dr Kováčová's surgery because you want to book an examination. Nurse Zuzana answers the phone.",
    },
    complete: [
      {
        before: "Už tri dni ťa bolí",
        after: ".",
        english: "Your ___ has been sore for three days.",
        accepted: ["hrdlo"],
      },
      {
        before: "Bolí ťa hrdlo a máš",
        after: ".",
        english: "Your throat is sore and you have a ___.",
        accepted: ["horúčku", "teplotu"],
      },
      {
        before: "Chceš sa objednať na",
        after: ".",
        english: "You want to book a medical ___.",
        accepted: ["vyšetrenie"],
      },
    ],
    turns: [
      {
        line: {
          text: "Ambulancia doktorky Kováčovej, dobrý deň.",
          english: "Dr Kováčová's surgery, hello.",
        },
        options: [
          "Ďakujem, aj vám.",
          "Dobrý deň. Chcem sa objednať k pani doktorke.",
          "Ahoj, ideš dnes do kina?",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Dobre. A čo vám je?",
          english: "All right. And what's wrong?",
        },
        options: [
          "Mám sa dobre, ďakujem.",
          "V pondelok mám veľa práce.",
          "Bolí ma hrdlo a mám horúčku.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Môžete prísť zajtra o pol desiatej?",
          english: "Can you come tomorrow at half past nine?",
        },
        options: [
          "Zajtra ráno nemôžem, pracujem. Máte voľný termín aj popoludní?",
          "Desiatu jem vždy o desiatej.",
          "Pol desiatej je deväť tridsať.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Popoludní máme otvorené len v stredu. Hodí sa vám streda o druhej?",
          english:
            "We are only open in the afternoon on Wednesdays. Does Wednesday at two suit you?",
        },
        options: [
          "Druhý deň v týždni je utorok.",
          "Áno, streda o druhej mi vyhovuje.",
          "Dobre, tak zajtra o pol desiatej.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Výborne. Nezabudnite si zobrať kartičku poistenca.",
          english: "Great. Don't forget to bring your health insurance card.",
        },
        options: [
          "Prepáčte, platím len v hotovosti.",
          "Poisťovňa je vedľa pošty.",
          "Dobre, zoberiem si ju.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Tak v stredu o druhej. Prajem vám skoré uzdravenie.",
          english: "Wednesday at two, then. I hope you get well soon.",
        },
        options: ["Ďakujem pekne. Dovidenia.", "Na zdravie!", "Ahoj, zavolaj mi večer."],
        answer: 0,
      },
    ],
    summaryKey: [
      "Pacienta tri dni bolí hrdlo a má horúčku, chce sa objednať k doktorke Kováčovej.",
      "Zajtra ráno nemôže prísť, lebo pracuje.",
      "Popoludní je ambulancia otvorená len v stredu, termín je v stredu o druhej.",
      "Má si zobrať kartičku poistenca.",
    ],
  },
  {
    id: "oslava-s-annou",
    level: "A2",
    partner: "anna",
    partnerName: "Anna",
    scenario: {
      text: "Bývaš v jednom byte s kamarátkou Annou. V sobotu má Anna narodeniny a chce doma urobiť malú oslavu. Potrebuje na to tvoju pomoc.",
      english:
        "You share a flat with your friend Anna. On Saturday it is Anna's birthday, and she wants to have a small party at home. She needs your help with it.",
    },
    complete: [
      {
        before: "V sobotu má Anna",
        after: ".",
        english: "On Saturday it is Anna's ___.",
        accepted: ["narodeniny"],
      },
      {
        before: "Anna chce doma urobiť malú",
        after: ".",
        english: "Anna wants to have a small ___ at home.",
        accepted: ["oslavu", "párty"],
      },
      {
        before: "Anna potrebuje tvoju",
        after: ".",
        english: "Anna needs your ___.",
        accepted: ["pomoc"],
      },
    ],
    turns: [
      {
        line: {
          text: "Ahoj! Vieš, že v sobotu mám narodeniny?",
          english: "Hi! Do you know it's my birthday on Saturday?",
        },
        options: [
          "Jasné, viem. Plánuješ niečo?",
          "Všetko najlepšie k meninám!",
          "V sobotu je obchod zatvorený.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Chcem urobiť doma malú oslavu. Pomôžeš mi?",
          english: "I want to have a small party at home. Will you help me?",
        },
        options: [
          "Nie, ja nemám v sobotu narodeniny.",
          "Jasné, pomôžem ti. Čo treba urobiť?",
          "Doma máme malú kuchyňu.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Treba kúpiť jedlo a pitie. Pôjdeš so mnou v piatok do obchodu?",
          english:
            "We need to buy food and drinks. Will you come to the shop with me on Friday?",
        },
        options: [
          "Prepáč, teraz nemám hlad.",
          "Obchod je hneď za rohom.",
          "Jasné. V piatok mám čas až po piatej.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Super, tak v piatok o šiestej. Upečieš aj tortu?",
          english: "Great, Friday at six, then. Will you bake a cake too?",
        },
        options: [
          "Piecť neviem, ale tortu môžem kúpiť v cukrárni.",
          "Ďakujem, tortu nechcem.",
          "O šiestej je už tma.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "To je fajn. Pozvala som asi desať ľudí. Nevadí ti to?",
          english: "That's fine. I've invited about ten people. Do you mind?",
        },
        options: [
          "Áno, desať eur stačí.",
          "Moja sestra sa volá Anna.",
          "Nie, nevadí. Čím viac ľudí, tým lepšie.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Ďakujem, si super! Tak v piatok o šiestej.",
          english: "Thanks, you're great! Friday at six, then.",
        },
        options: [
          "Dovidenia, pani Anna.",
          "Nemáš za čo. Teším sa na sobotu!",
          "Ďakujem, aj tebe dobrú chuť.",
        ],
        answer: 1,
      },
    ],
    summaryKey: [
      "Anna má v sobotu narodeniny a chce doma urobiť malú oslavu.",
      "V piatok o šiestej pôjdu spolu nakúpiť jedlo a pitie.",
      "Tortu kúpia v cukrárni, lebo spolubývajúci nevie piecť.",
      "Anna pozvala asi desať ľudí a nevadí to.",
    ],
  },
  {
    id: "reklamacia-kavovaru",
    level: "B1",
    partner: "lucia",
    partnerName: "Lucia",
    scenario: {
      text: "Tvoj nový kávovar po troch týždňoch prestal fungovať. Je ešte v záruke, a tak ho nesieš späť do obchodu. Chceš ho reklamovať. Pri pulte stojí predavačka Lucia.",
      english:
        "Your new coffee machine stopped working after three weeks. It is still under warranty, so you are taking it back to the shop. You want to make a warranty claim. The shop assistant Lucia is at the counter.",
    },
    complete: [
      {
        before: "Kávovar prestal fungovať po troch",
        after: ".",
        english: "The coffee machine stopped working after three ___.",
        accepted: ["týždňoch"],
      },
      {
        before: "Kávovar je ešte v",
        after: ".",
        english: "The coffee machine is still under ___.",
        accepted: ["záruke"],
      },
      {
        before: "Kávovar chceš",
        after: ".",
        english: "You want to ___ the coffee machine (make a warranty claim).",
        accepted: ["reklamovať", "vrátiť"],
      },
    ],
    turns: [
      {
        line: {
          text: "Dobrý deň, čo pre vás môžem urobiť?",
          english: "Hello, what can I do for you?",
        },
        options: [
          "Dobrý deň. Chcem reklamovať tento kávovar.",
          "Dobrý deň. Jednu kávu s mliekom, prosím.",
          "Ďakujem, len sa pozerám.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Rozumiem. Aký je s ním problém?",
          english: "I see. What's the problem with it?",
        },
        options: [
          "Problém je, že nemám čas.",
          "Od včera sa nedá zapnúť.",
          "Kávu pijem každé ráno.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Máte so sebou bloček alebo záručný list?",
          english: "Do you have the receipt or the warranty card with you?",
        },
        options: [
          "Nie, ďakujem, tašku nepotrebujem.",
          "Kávovar stál osemdesiat eur.",
          "Áno, nech sa páči, tu je bloček.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Ďakujem. Kávovar pošleme do servisu. Oprava môže trvať až tri týždne.",
          english:
            "Thank you. We'll send the coffee machine to the service centre. The repair can take up to three weeks.",
        },
        options: [
          "Áno, kávu pijem trikrát denne.",
          "To je dosť dlho. Nemôžete mi ho radšej vymeniť za nový?",
          "Prepáčte, ale moje auto je v poriadku.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Vymeniť ho môžeme, ale nový kus máme na sklade až v pondelok.",
          english:
            "We can exchange it, but we won't have a new one in stock until Monday.",
        },
        options: [
          "Dobre, tak ho opravte do piatku.",
          "Na sklade pracuje môj brat.",
          "V pondelok mi to vyhovuje, prídem popoludní.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Dobre. Tu je potvrdenie o reklamácii. V pondelok ho prineste so sebou.",
          english:
            "All right. Here is the confirmation of your claim. Bring it with you on Monday.",
        },
        options: [
          "Ďakujem, prinesiem ho. Dovidenia.",
          "Prosím, nemáte za čo.",
          "Nie, potvrdenie nepotrebujem.",
        ],
        answer: 0,
      },
    ],
    summaryKey: [
      "Nový kávovar po troch týždňoch prestal fungovať, nedá sa zapnúť.",
      "Zákazník má bloček a kávovar je v záruke.",
      "Oprava by trvala až tri týždne, preto chce kávovar vymeniť za nový.",
      "Nový kus bude v pondelok, zákazník príde popoludní a prinesie potvrdenie o reklamácii.",
    ],
  },
  {
    id: "listok-vo-vlaku",
    level: "B1",
    partner: "waiter",
    partnerName: "Peter",
    scenario: {
      text: "Cestuješ vlakom z Bratislavy do Žiliny. Lístok máš v mobile. Sprievodca Peter práve kontroluje cestovné lístky a s tvojím lístkom je nejaký problém.",
      english:
        "You are travelling by train from Bratislava to Žilina. Your ticket is on your phone. The conductor, Peter, is checking tickets, and there is some problem with yours.",
    },
    complete: [
      {
        before: "Cestuješ vlakom z Bratislavy do",
        after: ".",
        english: "You are travelling by train from Bratislava to ___.",
        accepted: ["Žiliny"],
      },
      {
        before: "Lístok máš v",
        after: ".",
        english: "Your ticket is on your ___.",
        accepted: ["mobile", "telefóne"],
      },
      {
        before: "Cestovné lístky kontroluje",
        after: ".",
        english: "The ___ is checking the tickets.",
        accepted: ["sprievodca"],
      },
    ],
    turns: [
      {
        line: {
          text: "Dobrý deň, cestovné lístky, prosím.",
          english: "Good afternoon, tickets, please.",
        },
        options: [
          "Ďakujem, lístok nepotrebujem.",
          "Dobrý deň, nech sa páči. Mám ho v mobile.",
          "Dobrý deň, jeden lístok do Žiliny, prosím.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Ďakujem. Lenže tento lístok je na zajtra, nie na dnes.",
          english: "Thank you. But this ticket is for tomorrow, not for today.",
        },
        options: [
          "Naozaj? Prepáčte, to je moja chyba. Čo teraz?",
          "Áno, zajtra idem do práce.",
          "Ďakujem, lístok je v poriadku.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Môžete si u mňa kúpiť nový lístok, ale zaplatíte aj prirážku.",
          english: "You can buy a new ticket from me, but you'll also pay a surcharge.",
        },
        options: [
          "Áno, u vás je to lacnejšie.",
          "Nie, ďakujem, nový mobil nepotrebujem.",
          "Dobre, rozumiem. Koľko to bude spolu?",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Spolu to bude jedenásť eur. Platíte v hotovosti?",
          english: "That will be eleven euros altogether. Are you paying in cash?",
        },
        options: [
          "Nie, ďakujem, kávu si nedám.",
          "Nie, hotovosť nemám. Môžem zaplatiť kartou?",
          "Jedenásť eur je za lístok málo.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Áno, kartou sa dá. A ten zajtrajší lístok môžete vrátiť cez aplikáciu.",
          english:
            "Yes, card is fine. And you can return tomorrow's ticket through the app.",
        },
        options: [
          "Áno, karta je v peňaženke.",
          "Do Žiliny prídeme o druhej.",
          "Výborne, ďakujem. Vrátim ho ešte dnes.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Nech sa páči, tu je nový lístok. Príjemnú cestu.",
          english: "Here is your new ticket. Have a pleasant journey.",
        },
        options: ["Ďakujem pekne. Dovidenia.", "Dobrú chuť!", "Ahoj, zavolám ti zajtra."],
        answer: 0,
      },
    ],
    summaryKey: [
      "Cestujúci má v mobile lístok na zajtra, nie na dnes.",
      "U sprievodcu si kúpi nový lístok a zaplatí aj prirážku, spolu jedenásť eur.",
      "Hotovosť nemá, platí kartou.",
      "Zajtrajší lístok vráti ešte dnes cez aplikáciu.",
    ],
  },
  {
    id: "grafy-pre-mareka",
    level: "B2",
    partner: "marek",
    partnerName: "Marek",
    scenario: {
      text: "Pracuješ v marketingovej firme v Košiciach. Je štvrtok popoludní. Tvoj kolega Marek musí v piatok do obeda odovzdať prezentáciu pre dôležitého klienta, ale nestíha. Prichádza za tebou s prosbou o pomoc.",
      english:
        "You work at a marketing company in Košice. It is Thursday afternoon. Your colleague Marek has to hand in a presentation for an important client by Friday lunchtime, but he is behind. He comes to you to ask for help.",
    },
    complete: [
      {
        before: "Pracuješ v marketingovej firme v",
        after: ".",
        english: "You work at a marketing company in ___.",
        accepted: ["Košiciach"],
      },
      {
        before: "Je",
        after: "popoludní.",
        english: "It is ___ afternoon.",
        accepted: ["štvrtok"],
      },
      {
        before: "Marek musí v piatok do obeda odovzdať",
        after: "pre dôležitého klienta.",
        english:
          "By Friday lunchtime Marek has to hand in a ___ for an important client.",
        accepted: ["prezentáciu"],
      },
    ],
    turns: [
      {
        line: {
          text: "Počuj, máš chvíľku? Potreboval by som pomoc s jednou vecou.",
          english: "Listen, have you got a moment? I could use some help with something.",
        },
        options: [
          "Dobrý deň, pán kolega. S čím vám môžem pomôcť?",
          "Nie, ďakujem, pomoc nepotrebujem.",
          "Jasné, hovor. O čo ide?",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Zajtra do obeda musím odovzdať prezentáciu pre klienta a vôbec to nestíham.",
          english:
            "I have to hand in the presentation for the client by lunchtime tomorrow, and I'm nowhere near on time.",
        },
        options: [
          "To je nepríjemné. S ktorou časťou ti môžem pomôcť?",
          "Gratulujem, to je skvelá správa!",
          "Prezentácia sa mi včera veľmi páčila.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Text mám skoro hotový, ale grafy ešte vôbec nemám.",
          english: "The text is almost done, but I don't have any of the charts yet.",
        },
        options: [
          "Tak mi pošli text, prečítam ho a opravím chyby.",
          "Grafy ti môžem urobiť ja. Pošli mi tie čísla.",
          "Text je hotový, takže máš všetko.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Super, ďakujem! Čísla ti pošlem e-mailom do pol hodiny. Stihneš to do rána?",
          english:
            "Great, thanks! I'll email you the numbers within half an hour. Can you get it done by the morning?",
        },
        options: [
          "Pol hodiny je na grafy málo.",
          "Áno, čísla mi pošli do rána.",
          "Večer mám tréning, ale grafy ti pošlem zajtra do deviatej.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Do deviatej to úplne stačí. Ak budeš niekedy potrebovať pomoc ty, daj vedieť.",
          english:
            "Nine is absolutely fine. If you ever need help yourself, let me know.",
        },
        options: [
          "Ďakujem, budem s tým počítať.",
          "Áno, povedz mi to zajtra ráno.",
          "Deviata je pre mňa príliš neskoro.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Ešte raz vďaka. Bez teba by som to nestihol.",
          english: "Thanks again. I wouldn't have made it without you.",
        },
        options: [
          "Veľmi ma to mrzí.",
          "Nemáš za čo. Zajtra ti držím palce!",
          "Prepáč, ale zajtra to nestihnem.",
        ],
        answer: 1,
      },
    ],
    summaryKey: [
      "Marek musí v piatok do obeda odovzdať prezentáciu pre klienta a nestíha.",
      "Text má takmer hotový, chýbajú mu grafy.",
      "Kolega urobí grafy, Marek mu do pol hodiny pošle čísla e-mailom.",
      "Večer má kolega tréning, preto grafy pošle v piatok do deviatej, čo Marekovi stačí.",
    ],
  },
  {
    id: "hluk-u-susedov",
    level: "B2",
    partner: "maria",
    partnerName: "Mária",
    scenario: {
      text: "Bývaš v bytovom dome na treťom poschodí. Včera večer u teba boli priatelia a do neskorej noci ste pozerali hokej. Dnes ráno ti pri dverách zvoní susedka z bytu pod tebou, pani Mária.",
      english:
        "You live on the third floor of a block of flats. Last night friends were at your place, and you watched ice hockey until late at night. This morning your neighbour from the flat below, Mária, rings at your door.",
    },
    complete: [
      {
        before: "Bývaš v bytovom dome na",
        after: "poschodí.",
        english: "You live on the ___ floor of a block of flats.",
        accepted: ["treťom"],
      },
      {
        before: "Do neskorej noci ste s priateľmi pozerali",
        after: ".",
        english: "You and your friends watched ___ until late at night.",
        accepted: ["hokej"],
      },
      {
        before: "Pri dverách ti zvoní",
        after: "z bytu pod tebou.",
        english: "Your ___ from the flat below is ringing at the door.",
        accepted: ["susedka"],
      },
    ],
    turns: [
      {
        line: {
          text: "Dobrý deň. Prepáčte, že vyrušujem. Bývam pod vami.",
          english: "Good morning. Sorry to disturb you. I live below you.",
        },
        options: [
          "Nie, ďakujem, nič nekupujem.",
          "Dobrý deň, vôbec nevyrušujete. Potrebujete niečo?",
          "Ahoj, poď ďalej. Dáš si kávu?",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Včera bol u vás veľký hluk až do jednej v noci. Nemohla som vôbec spať.",
          english:
            "Last night it was very noisy at your place until one in the morning. I couldn't sleep at all.",
        },
        options: [
          "To ma veľmi mrzí. Bolo hokejové finále a asi nás bolo počuť až k vám.",
          "Áno, u nás bolo včera veľmi veselo.",
          "Skúste si večer dať čaj, potom sa lepšie spí.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Chápem, ale ráno vstávam o piatej do práce. Nočný pokoj je predsa od desiatej.",
          english:
            "I understand, but I get up at five for work. Quiet hours start at ten, after all.",
        },
        options: [
          "Nočný pokoj platí len cez víkend.",
          "Od desiatej do piatej je sedem hodín.",
          "Máte pravdu. Nabudúce budeme po desiatej potichu.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Ďakujem. A keď budete mať zase návštevu, mohli by ste mi dať vedieť vopred?",
          english:
            "Thank you. And when you have guests again, could you let me know in advance?",
        },
        options: [
          "Samozrejme, dám vám vedieť aspoň deň vopred.",
          "Ďakujem, ale ku mne nemusíte chodiť.",
          "Prepáčte, ale ja návštevy nemám.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "To by bolo fajn. Viete, nechcem sa hádať, len sa potrebujem vyspať.",
          english:
            "That would be good. You know, I don't want to argue, I just need my sleep.",
        },
        options: [
          "Spať môžete aj popoludní, nie?",
          "Hádať sa nemusíme, hokej bude aj zajtra.",
          "Úplne vás chápem. Ešte raz sa ospravedlňujem.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Nič sa nestalo. Tak pekný deň a vďaka za pochopenie.",
          english: "No harm done. Have a nice day, and thanks for understanding.",
        },
        options: [
          "Ďakujem, aj vám dobrú noc.",
          "Aj vám pekný deň. Dovidenia.",
          "Nemáte za čo, hokej bol naozaj super.",
        ],
        answer: 1,
      },
    ],
    summaryKey: [
      "Susedka z bytu pod nimi sa sťažuje, že u nich bol hluk do jednej v noci a nemohla spať.",
      "Pozerali hokejové finále a bolo ich počuť.",
      "Susedka vstáva o piatej do práce a nočný pokoj je od desiatej.",
      "Nabudúce budú po desiatej potichu a o návšteve jej dajú vedieť aspoň deň vopred.",
    ],
  },
  {
    id: "pracovny-pohovor",
    level: "C1",
    partner: "receptionist",
    partnerName: "Eva",
    scenario: {
      text: "Uchádzaš sa o prácu v bratislavskej pobočke medzinárodnej logistickej firmy. Pozícia je v tíme, ktorý sa stará o slovenských zákazníkov. Pohovor vedie vedúca tímu Eva Horváthová. Zaujíma ju najmä, ako zvládaš náročné situácie.",
      english:
        "You are applying for a job at the Bratislava branch of an international logistics company. The position is in the team that looks after Slovak customers. The interview is led by the team leader, Eva Horváthová. She is mainly interested in how you handle difficult situations.",
    },
    complete: [
      {
        before: "Uchádzaš sa o prácu v bratislavskej",
        after: "medzinárodnej logistickej firmy.",
        english:
          "You are applying for a job at the Bratislava ___ of an international logistics company.",
        accepted: ["pobočke"],
      },
      {
        before: "Tím sa stará o slovenských",
        after: ".",
        english: "The team looks after Slovak ___.",
        accepted: ["zákazníkov", "klientov"],
      },
      {
        before: "Eva Horváthová chce vedieť, ako zvládaš náročné",
        after: ".",
        english: "Eva Horváthová wants to know how you handle difficult ___.",
        accepted: ["situácie"],
      },
    ],
    turns: [
      {
        line: {
          text: "Dobrý deň, sadnite si, prosím. Čo vás na tejto pozícii zaujalo?",
          english: "Hello, please have a seat. What drew you to this position?",
        },
        options: [
          "Inzerát je na vašej webovej stránke už od marca.",
          "Ďakujem. Zaujala ma hlavne práca so zákazníkmi a to, že firma pôsobí v celej Európe.",
          "Ďakujem, radšej postojím. Najviac ma zaujíma, koľko sa tu zarába.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Predstavte si, že vám volá nahnevaný zákazník, lebo zásielka mešká už týždeň. Ako zareagujete?",
          english:
            "Imagine an angry customer calls you because a delivery is already a week late. How do you respond?",
        },
        options: [
          "Najprv ho nechám dohovoriť, ospravedlním sa a zistím, kde je zásielka.",
          "Poviem mu, že za meškanie môže kuriér, nie my, a že s tým nič nenarobíme.",
          "Vysvetlím mu, že týždeň je v logistike bežné meškanie a nie je dôvod sa hnevať.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Dobre. A čo ak sa ani nový termín nepodarí dodržať?",
          english: "Good. And what if even the new date can't be met?",
        },
        options: [
          "Dúfam, že sa to nestane, takže to vopred riešiť nebudem.",
          "Termín je uvedený v zmluve, takže za ďalšie meškanie už nezodpovedám.",
          "Ozvem sa mu ešte pred termínom, vysvetlím dôvod a ponúknem mu napríklad dopravu zadarmo.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "V životopise uvádzate prax v Rakúsku. Ktoré jazyky ovládate najlepšie?",
          english:
            "Your CV mentions work experience in Austria. Which languages do you speak best?",
        },
        options: [
          "Rakúsko je krásna krajina, hlavne v lete, keď sa dá chodiť po horách.",
          "Prax v Rakúsku trvala tri roky a bola veľmi zaujímavá.",
          "Najlepšie ovládam nemčinu a angličtinu. Slovenčinu sa ešte učím, ale rozumiem takmer všetkému.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Keby sme sa dohodli, odkedy by ste mohli nastúpiť?",
          english: "If we reach an agreement, when could you start?",
        },
        options: [
          "Začínam zvyčajne o ôsmej a končím o štvrtej.",
          "V súčasnej práci mám dvojmesačnú výpovednú lehotu, takže najskôr od prvého marca.",
          "Nastupovať budem na zastávke pri hlavnej stanici.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Rozumiem. Ozveme sa vám do konca budúceho týždňa. Máte na nás ešte nejakú otázku?",
          english:
            "I see. We'll get back to you by the end of next week. Do you have any questions for us?",
        },
        options: [
          "Áno, jednu. Ako by vyzeralo zaškolenie v prvých týždňoch?",
          "Nie, ďakujem, ozvem sa vám ja do konca budúceho týždňa.",
          "Áno. Koľko uchádzačov ste už tento mesiac odmietli?",
        ],
        answer: 0,
      },
    ],
    summaryKey: [
      "Uchádzača zaujala práca so zákazníkmi a to, že firma pôsobí v celej Európe.",
      "Nahnevaného zákazníka nechá dohovoriť, ospravedlní sa a zistí, kde je zásielka; ak sa nový termín nedá dodržať, ozve sa vopred a ponúkne kompenzáciu, napríklad dopravu zadarmo.",
      "Najlepšie ovláda nemčinu a angličtinu, slovenčinu sa ešte učí.",
      "Pre dvojmesačnú výpovednú lehotu môže nastúpiť najskôr od prvého marca.",
      "Firma sa ozve do konca budúceho týždňa; uchádzač sa pýta na zaškolenie.",
    ],
  },
];
