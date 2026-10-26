import type { EvalBase } from "./types";

/**
 * Correct answers to real test prompts, one per task and level, each with the
 * errors the builder can put into it. Every `from` occurs once in the full
 * answer (for Interactive Writing that includes the two questions), and every
 * `to` must be an error a Slovak teacher would mark, not a weaker variant.
 * Photo answers describe the photo as it is; check the photo before editing.
 */
export const EVAL_BASES: EvalBase[] = [
  {
    id: "wp-trh-a1",
    kind: "writePhoto",
    photo: "trh",
    wrongPhoto: "plaz",
    targetLevel: "A1",
    source: "claude",
    response:
      "Na fotke je trh. Predávajú tam ovocie a zeleninu. Ľudia nakupujú. Pri stánku sú stromy a lavička.",
    mutations: [
      { topic: "nounEndings", from: "zeleninu", to: "zelenina" },
      { topic: "verbForms", from: "nakupujú", to: "nakupuje" },
      { topic: "accents", from: "Ľudia", to: "Ludia" },
      { topic: "vocabulary", from: "ovocie", to: "ovoce" },
    ],
  },
  {
    id: "wp-kaviaren-a2",
    kind: "writePhoto",
    photo: "kaviaren",
    wrongPhoto: "plaz",
    targetLevel: "A2",
    source: "claude",
    response:
      "Na fotke je pekná kaviareň. Má veľké okná a drevené stoly. Na stoloch sú malé kvety. V kaviarni nie je veľa ľudí, vzadu sedí jeden človek. Na stenách visia obrázky a zo stropu visia lampy. Páči sa mi tam.",
    mutations: [
      { topic: "adjectiveAgreement", from: "pekná kaviareň", to: "pekný kaviareň" },
      { topic: "wordOrder", from: "Páči sa mi tam", to: "Páči mi sa tam" },
      { topic: "nounEndings", from: "zo stropu", to: "zo strop" },
      { topic: "accents", from: "obrázky", to: "obrazky" },
      { topic: "vocabulary", from: "V kaviarni", to: "V kavárně" },
      { topic: "verbForms", from: "visia lampy", to: "visí lampy" },
    ],
  },
  {
    id: "wp-vecera-b1",
    kind: "writePhoto",
    photo: "vecera",
    wrongPhoto: "namestie",
    targetLevel: "B1",
    source: "claude",
    response:
      "Na fotke vidím rodinu pri večeri. Pri stole sedí päť ľudí: babka, rodičia a dve deti. Na stole je biely obrus a veľa jedla, napríklad ryža, zelenina a šalát. Dievča sedí vedľa babky a chlapec vedľa mamy. Všetci sa usmievajú, takže si myslím, že sa majú radi a jedlo im chutí. Vyzerá to ako obyčajný večer, keď sa celá rodina stretne doma.",
    mutations: [
      { topic: "nounEndings", from: "vedľa babky", to: "vedľa babka" },
      { topic: "functionWords", from: "si myslím", to: "sa myslím" },
      { topic: "adjectiveAgreement", from: "biely obrus", to: "biela obrus" },
      { topic: "aspect", from: "sa usmievajú", to: "sa usmejú" },
      { topic: "wordOrder", from: "že sa majú radi", to: "že majú sa radi" },
      { topic: "verbForms", from: "Vyzerá to", to: "Vyzerajú to" },
    ],
  },
  {
    id: "wp-namestie-b2",
    kind: "writePhoto",
    photo: "namestie",
    wrongPhoto: "kuchyna",
    targetLevel: "B2",
    source: "claude",
    response:
      "Fotka zachytáva veľké námestie v historickom centre mesta, pravdepodobne niekde v strednej Európe. Vľavo stoja farebné meštianske domy so strmými strechami a vpravo je červená budova s vysokou vežou a hodinami. Uprostred námestia sa týči vysoký stĺp so sochou. Je slnečný deň, obloha je jasná a na zemi vidno dlhý tieň. Ľudí je tam prekvapivo málo, iba pár turistov sa prechádza okolo kaviarne so slnečníkmi. Pôsobí to pokojne, hoci si viem predstaviť, že cez víkend je tam rušno.",
    mutations: [
      { topic: "nounEndings", from: "so sochou", to: "so socha" },
      { topic: "adjectiveAgreement", from: "červená budova", to: "červený budova" },
      { topic: "aspect", from: "sa prechádza", to: "sa prejde" },
      {
        topic: "functionWords",
        from: "v historickom centre",
        to: "na historickom centre",
      },
      { topic: "wordOrder", from: "hoci si viem", to: "hoci viem si" },
      { topic: "verbForms", from: "stoja farebné", to: "stojí farebné" },
    ],
  },
  {
    id: "wp-letisko-c1",
    kind: "writePhoto",
    photo: "letisko",
    wrongPhoto: "trh",
    targetLevel: "C1",
    source: "claude",
    response:
      "Fotografia zachytáva pohľad z čakárne na letisku cez veľkú presklenú stenu. V popredí sú rady prázdnych sedadiel, ktoré vrhajú tiene na lesklú dlážku, a za oknom stojí na odstavnej ploche obrovské dopravné lietadlo s modrou chvostovou plochou. Vzadu sa črtá riadiaca veža a nízke budovy terminálu, nad ktorými visí sivá, zamračená obloha. Celá scéna pôsobí nezvyčajne tichým dojmom: nikto nikam nebeží a nikto nečaká na nástup. Možno ide o skoré ráno alebo o chvíľu medzi dvoma letmi, keď sa letisko na pár minút upokojí.",
    mutations: [
      { topic: "vocabulary", from: "Možno ide o", to: "Možno sa jedná o" },
      { topic: "nounEndings", from: "dvoma letmi", to: "dvoma letami" },
      { topic: "adjectiveAgreement", from: "lesklú dlážku", to: "lesklý dlážku" },
      { topic: "aspect", from: "nikto nečaká", to: "nikto nepočká" },
      { topic: "wordOrder", from: "keď sa letisko", to: "keď letisko sa" },
      { topic: "verbForms", from: "vrhajú", to: "vrhá" },
    ],
  },
  {
    id: "sp-park-a2",
    kind: "speakPhoto",
    photo: "park",
    wrongPhoto: "kuchyna",
    targetLevel: "A2",
    seconds: 45,
    source: "claude",
    response:
      "Na fotke je park. Je tam veľa stromov a zelená tráva. Vľavo je cestička. V parku sa prechádzajú ľudia, ale nie je ich veľa. Je pekné počasie, svieti slnko. Myslím, že je jeseň, lebo na zemi sú listy. Rád by som sa tam prechádzal.",
    mutations: [
      { topic: "nounEndings", from: "veľa stromov", to: "veľa stromy" },
      { topic: "adjectiveAgreement", from: "zelená tráva", to: "zelený tráva" },
      { topic: "wordOrder", from: "Rád by som sa", to: "Rád som by sa" },
      { topic: "verbForms", from: "svieti slnko", to: "svietia slnko" },
      { topic: "vocabulary", from: "jeseň", to: "podzim" },
    ],
  },
  {
    id: "sp-kuchyna-b1",
    kind: "speakPhoto",
    photo: "kuchyna",
    wrongPhoto: "namestie",
    targetLevel: "B1",
    seconds: 70,
    source: "claude",
    response:
      "Na fotke je moderná kuchyňa. Skrinky sú biele a pracovná doska je drevená. Vľavo je rúra a nad ňou varná doska. Pri okne stojí malý biely stôl a dve hnedé stoličky. Na stole sú kvety, noviny a nejaká miska. Na stene visia hodiny. Kuchyňa je svetlá, lebo má dve veľké okná. Myslím si, že tu niekto býva sám alebo vo dvojici, pretože stôl je dosť malý. Takú kuchyňu by som chcel mať aj ja.",
    mutations: [
      { topic: "adjectiveAgreement", from: "moderná kuchyňa", to: "moderný kuchyňa" },
      { topic: "nounEndings", from: "Pri okne", to: "Pri okno" },
      { topic: "functionWords", from: "Myslím si", to: "Myslím sa" },
      { topic: "verbForms", from: "visia hodiny", to: "visí hodiny" },
      { topic: "wordOrder", from: "by som chcel", to: "chcel by som" },
    ],
  },
  {
    id: "sp-plaz-b2",
    kind: "speakPhoto",
    photo: "plaz",
    wrongPhoto: "vecera",
    targetLevel: "B2",
    seconds: 85,
    source: "claude",
    response:
      "Na fotke je pláž s jemným bielym pieskom a priezračnou tyrkysovou vodou. Vlny sú malé a pomaly sa rozlievajú po piesku. Na obzore vidno ostrov alebo možno nejaký kopec. Obloha je modrá, ale je na nej veľa oblakov, takže sa zdá, že sa počasie môže čoskoro zmeniť. Na pláži nie sú žiadni ľudia ani lehátka, čo je dosť nezvyčajné. Vyzerá to ako miesto, kam by som chcel ísť na dovolenku, keby som mal viac času a peňazí.",
    mutations: [
      { topic: "nounEndings", from: "pieskom", to: "piesok" },
      { topic: "adjectiveAgreement", from: "žiadni ľudia", to: "žiadne ľudia" },
      { topic: "aspect", from: "sa rozlievajú", to: "sa rozlejú" },
      { topic: "wordOrder", from: "kam by som chcel", to: "kam som by chcel" },
      { topic: "functionWords", from: "ani lehátka", to: "aj lehátka" },
      { topic: "verbForms", from: "Vlny sú malé", to: "Vlny je malé" },
    ],
  },
  {
    id: "iw-volny-cas-a1",
    kind: "interactiveWriting",
    promptId: "volny-cas",
    targetLevel: "A1",
    source: "claude",
    response: "Najradšej som v parku. Je tam ticho a veľa stromov. Mám rád prírodu.",
    followUp: "Chodím tam každú sobotu. Chodím so psom.",
    mutations: [
      { topic: "nounEndings", from: "so psom", to: "so pes" },
      { topic: "verbForms", from: "Je tam ticho", to: "Sú tam ticho" },
      { topic: "accents", from: "každú", to: "kazdú" },
    ],
  },
  {
    id: "iw-jedlo-a2",
    kind: "interactiveWriting",
    promptId: "jedlo",
    targetLevel: "A2",
    source: "claude",
    response:
      "Najradšej mám bryndzové halušky. Jem ich hlavne cez víkend. Často ich jem s kamarátmi v reštaurácii blízko školy.",
    followUp:
      "Áno, viem. Najprv uvarím halušky, potom ich zmiešam s bryndzou a navrch dám slaninu. Nie je to ťažké, ale trvá to asi hodinu.",
    mutations: [
      { topic: "nounEndings", from: "s kamarátmi", to: "s kamaráti" },
      { topic: "functionWords", from: "s bryndzou", to: "z bryndzou" },
      { topic: "accents", from: "reštaurácii", to: "restaurácii" },
      { topic: "verbForms", from: "trvá to", to: "trvajú to" },
      { topic: "adjectiveAgreement", from: "bryndzové halušky", to: "bryndzový halušky" },
    ],
  },
  {
    id: "iw-mesto-dedina-b1",
    kind: "interactiveWriting",
    promptId: "mesto-dedina",
    targetLevel: "B1",
    source: "claude",
    response:
      "Podľa mňa je lepšie bývať v meste, aspoň pre mladých ľudí. V meste je viac práce, obchodov a kultúry. Keď chcem ísť do kina alebo na koncert, nepotrebujem auto, stačí mi električka. Na druhej strane je v meste veľa hluku a vzduch nie je čistý. Na dedine je pokoj, ale autobus tam chodí iba dvakrát za deň.",
    followUp:
      "Bývam v Bratislave a zmenil by som dopravu. Ráno sú v uliciach dlhé zápchy a autobusy často meškajú. Chcel by som, aby bolo v meste viac cyklistických chodníkov a zelene.",
    mutations: [
      { topic: "nounEndings", from: "do kina", to: "do kino" },
      { topic: "functionWords", from: "aby bolo", to: "že bolo" },
      { topic: "wordOrder", from: "zmenil by som", to: "zmenil som by" },
      { topic: "adjectiveAgreement", from: "dlhé zápchy", to: "dlhí zápchy" },
      { topic: "verbForms", from: "vzduch nie je", to: "vzduch nie sú" },
      { topic: "vocabulary", from: "je pokoj", to: "je kľud" },
    ],
  },
  {
    id: "iw-domace-zviera-b2",
    kind: "interactiveWriting",
    promptId: "domace-zviera",
    targetLevel: "B2",
    source: "claude",
    response:
      "Doma máme mačku, ktorá sa volá Mica. Našli sme ju pred tromi rokmi pred naším domom, keď bola ešte malé, vystrašené mačiatko. Odvtedy je z nej rozmaznaná dáma, ktorá spí celé dni na gauči a v noci behá po byte. Napriek tomu si neviem predstaviť, že by sme ju nemali.",
    followUp:
      "Myslím si, že to závisí od toho, koľko času má majiteľ. Veľký pes potrebuje veľa pohybu, takže ak s ním človek chodí von iba na desať minút, pes trpí. Ak však s ním chodí na dlhé prechádzky a byt nie je príliš malý, nevidím v tom problém.",
    mutations: [
      { topic: "nounEndings", from: "pred tromi rokmi", to: "pred tri roky" },
      { topic: "adjectiveAgreement", from: "rozmaznaná dáma", to: "rozmaznaný dáma" },
      { topic: "aspect", from: "Našli sme ju", to: "Nachádzali sme ju" },
      { topic: "functionWords", from: "závisí od toho", to: "závisí z toho" },
      { topic: "wordOrder", from: "si neviem predstaviť", to: "neviem si predstaviť" },
      { topic: "verbForms", from: "pes trpí", to: "pes trpia" },
    ],
  },
  {
    id: "ws-preco-slovencina-a1",
    kind: "writingSample",
    promptId: "preco-slovencina",
    targetLevel: "A1",
    source: "claude",
    response:
      "Učím sa slovenčinu, lebo moja žena je Slovenka. Slovenčina je pekná. Baví ma čítať. Gramatika je ťažká.",
    mutations: [
      { topic: "adjectiveAgreement", from: "moja žena", to: "môj žena" },
      { topic: "accents", from: "ťažká", to: "tažká" },
      { topic: "nounEndings", from: "Baví ma", to: "Baví mi" },
    ],
  },
  {
    id: "ws-idealny-vikend-a2",
    kind: "writingSample",
    promptId: "idealny-vikend",
    targetLevel: "A2",
    source: "claude",
    response:
      "Môj ideálny víkend by bol v horách. V sobotu ráno by som išiel s priateľmi na túru. Večer by sme varili na chate a hrali karty. V nedeľu by som dlho spal a potom by som čítal knihu. Na obed by sme išli do reštaurácie a jedli bryndzové halušky. Večer by som bol doma a pozeral film.",
    mutations: [
      { topic: "wordOrder", from: "by som išiel", to: "som by išiel" },
      { topic: "nounEndings", from: "s priateľmi", to: "s priatelia" },
      { topic: "vocabulary", from: "do reštaurácie", to: "do restaurace" },
      { topic: "verbForms", from: "sme varili", to: "sme varil" },
      { topic: "accents", from: "bryndzové", to: "bryndzove" },
    ],
  },
  {
    id: "ws-zivotne-prostredie-b1",
    kind: "writingSample",
    promptId: "zivotne-prostredie",
    targetLevel: "B1",
    source: "claude",
    response:
      "Myslím si, že životné prostredie je jedna z najväčších tém dnešnej doby. Každý z nás môže urobiť niečo malé, napríklad triediť odpad alebo menej jazdiť autom. Ja sa snažím chodiť do práce na bicykli a v obchode si beriem vlastnú tašku. Niekedy je to nepohodlné, najmä keď prší, ale zvykol som si. Minulý rok som prestal kupovať vodu v plastových fľašiach. Na druhej strane si myslím, že najväčšiu zodpovednosť majú veľké firmy a štát. Keby továrne viac dbali na ochranu prírody, bol by vzduch v mestách oveľa čistejší.",
    mutations: [
      { topic: "nounEndings", from: "najväčších tém", to: "najväčších témy" },
      { topic: "aspect", from: "prestal kupovať", to: "prestal kúpiť" },
      { topic: "functionWords", from: "si beriem", to: "sa beriem" },
      {
        topic: "wordOrder",
        from: "Na druhej strane si myslím",
        to: "Na druhej strane myslím si",
      },
      { topic: "adjectiveAgreement", from: "vlastnú tašku", to: "vlastný tašku" },
      { topic: "verbForms", from: "majú veľké firmy", to: "má veľké firmy" },
    ],
  },
  {
    id: "ws-turizmus-b2",
    kind: "writingSample",
    promptId: "turizmus",
    targetLevel: "B2",
    source: "claude",
    response:
      "Podľa mňa prináša turizmus mestám výhody aj problémy a záleží najmä na tom, ako ho mesto riadi. Turisti míňajú peniaze v hoteloch, reštauráciách a obchodoch, vďaka čomu vznikajú nové pracovné miesta. Mnohé historické budovy by bez peňazí od návštevníkov chátrali. Na druhej strane sa centrá niektorých miest, napríklad Benátok alebo Prahy, menia na kulisy pre turistov. Byty sa prenajímajú cez internet, nájomné rastie a domáci obyvatelia sa sťahujú na okraj mesta. Preto by mestá mali turizmus regulovať, napríklad obmedziť krátkodobé prenájmy alebo zaviesť poplatok pre jednodňových návštevníkov.",
    mutations: [
      { topic: "nounEndings", from: "v hoteloch", to: "v hotely" },
      { topic: "functionWords", from: "na okraj mesta", to: "do okraja mesta" },
      { topic: "aspect", from: "nájomné rastie", to: "nájomné vzrastie" },
      { topic: "adjectiveAgreement", from: "Mnohé historické", to: "Mnohí historické" },
      { topic: "wordOrder", from: "Preto by mestá mali", to: "Preto mestá by mali" },
      { topic: "verbForms", from: "Turisti míňajú", to: "Turisti míňa" },
    ],
  },
  {
    id: "ws-kultura-zadarmo-c1",
    kind: "writingSample",
    promptId: "kultura-zadarmo",
    targetLevel: "C1",
    source: "claude",
    response:
      "Myšlienka, aby boli múzeá, galérie a divadlá prístupné bezplatne, znie na prvý pohľad lákavo. Kultúra by sa tak dostala aj k ľuďom, ktorí si dnes lístok nemôžu dovoliť, a deti z chudobnejších rodín by mali rovnakú šancu spoznať umenie ako ich rovesníci. Navyše by vstup zadarmo mohol prilákať návštevníkov, ktorí by inak do galérie nikdy nezavítali.\n\nNa druhej strane treba zvážiť, kto by takéto inštitúcie financoval. Ak by štát prestal vyberať vstupné, peniaze by musel vziať z iných oblastí, napríklad zo školstva alebo zo zdravotníctva. Hrozí aj to, že by si ľudia prestali vážiť niečo, za čo nemusia platiť.\n\nZa rozumný kompromis považujem model, v ktorom by boli stále expozície zadarmo aspoň raz do mesiaca a študenti a dôchodcovia by mali výraznú zľavu. Tak by sa kultúra otvorila širšej verejnosti bez toho, aby inštitúcie prišli o podstatnú časť príjmov.",
    mutations: [
      { topic: "vocabulary", from: "treba zvážiť", to: "je potreba zvážiť" },
      {
        topic: "nounEndings",
        from: "z chudobnejších rodín",
        to: "z chudobnejších rodinách",
      },
      { topic: "aspect", from: "prestal vyberať", to: "prestal vybrať" },
      { topic: "wordOrder", from: "že by si ľudia", to: "že by ľudia si" },
      { topic: "adjectiveAgreement", from: "výraznú zľavu", to: "výrazný zľavu" },
      { topic: "functionWords", from: "bez toho, aby", to: "bez toho, že" },
    ],
  },
  {
    id: "sc-ucenie-s-marekom-a2",
    kind: "summarizeConversation",
    listening: "ucenie-s-marekom",
    targetLevel: "A2",
    source: "claude",
    response:
      "Marek sa chce so mnou učiť na skúšku z histórie. V stredu nemôže, preto sa stretneme vo štvrtok o druhej v knižnici. Prinesiem svoje poznámky.",
    mutations: [
      { topic: "nounEndings", from: "z histórie", to: "z história" },
      { topic: "accents", from: "skúšku", to: "skušku" },
      { topic: "wordOrder", from: "Marek sa chce", to: "Marek chce sa" },
    ],
  },
  {
    id: "sc-nahradny-test-b1",
    kind: "summarizeConversation",
    listening: "nahradny-test",
    targetLevel: "B1",
    source: "claude",
    response:
      "Študent nebol minulý týždeň na teste, pretože bol chorý. Pani Mária mu dala nový termín: v piatok o ôsmej ráno v miestnosti číslo dvanásť. Slovník nepotrebuje, ale musí priniesť potvrdenie od lekára.",
    mutations: [
      { topic: "functionWords", from: "pretože", to: "preto" },
      { topic: "nounEndings", from: "od lekára", to: "od lekár" },
      { topic: "verbForms", from: "musí", to: "musia" },
      { topic: "aspect", from: "mu dala", to: "mu dávala" },
      { topic: "accents", from: "ôsmej", to: "osmej" },
    ],
  },
  {
    id: "sc-hluk-u-susedov-b2",
    kind: "summarizeConversation",
    listening: "hluk-u-susedov",
    targetLevel: "B2",
    source: "claude",
    response:
      "Susedka z bytu podo mnou, pani Mária, sa sťažovala, že u mňa bol včera hluk až do jednej v noci a nemohla spať. S priateľmi sme pozerali hokejové finále a zrejme sme boli dosť hluční. Vysvetlila mi, že vstáva o piatej do práce a že nočný pokoj platí od desiatej. Ospravedlnil som sa a sľúbil som jej, že nabudúce budeme po desiatej potichu a o návšteve jej dám vedieť aspoň deň vopred.",
    mutations: [
      { topic: "nounEndings", from: "o návšteve", to: "o návštevu" },
      { topic: "aspect", from: "jej dám vedieť", to: "jej budem dať vedieť" },
      { topic: "adjectiveAgreement", from: "nočný pokoj", to: "nočná pokoj" },
      { topic: "wordOrder", from: "Ospravedlnil som sa", to: "Ospravedlnil sa som" },
      { topic: "functionWords", from: "od desiatej", to: "z desiatej" },
      { topic: "verbForms", from: "sme boli dosť", to: "sme bol dosť" },
    ],
  },
  {
    id: "rts-moje-mesto-a2",
    kind: "readThenSpeak",
    promptId: "moje-mesto",
    targetLevel: "A2",
    seconds: 50,
    source: "claude",
    response:
      "Bývam v Košiciach. Košice sú druhé najväčšie mesto na Slovensku. V centre je pekná katedrála a veľa kaviarní. Môžeme tam chodiť do divadla alebo do parku. Páči sa mi, že ľudia sú milí. Nepáči sa mi, že v zime je tam smog.",
    mutations: [
      { topic: "nounEndings", from: "v Košiciach", to: "v Košice" },
      { topic: "adjectiveAgreement", from: "pekná katedrála", to: "pekný katedrála" },
      { topic: "wordOrder", from: "Páči sa mi, že", to: "Sa mi páči, že" },
      { topic: "verbForms", from: "ľudia sú milí", to: "ľudia je milí" },
    ],
  },
  {
    id: "rts-kniha-film-b1",
    kind: "readThenSpeak",
    promptId: "kniha-film",
    targetLevel: "B1",
    seconds: 80,
    source: "claude",
    response:
      "Môj obľúbený film sú Pelíšky. Je to česká komédia o dvoch rodinách v Prahe v roku 1967. Páči sa mi, pretože je zábavná, ale zároveň trochu smutná. Postavy sa často hádajú, ale v podstate sa majú radi. Film som videl asi desaťkrát a stále sa smejem na tých istých scénach. Odporučil by som ho každému, kto má rád humor a trochu histórie.",
    mutations: [
      { topic: "nounEndings", from: "o dvoch rodinách", to: "o dve rodiny" },
      { topic: "wordOrder", from: "Odporučil by som ho", to: "Odporučil by ho som" },
      { topic: "functionWords", from: "pretože je zábavná", to: "preto je zábavná" },
      { topic: "verbForms", from: "sa často hádajú", to: "sa často háda" },
      { topic: "adjectiveAgreement", from: "česká komédia", to: "český komédia" },
    ],
  },
  {
    id: "rts-praca-alebo-skola-b2",
    kind: "readThenSpeak",
    promptId: "praca-alebo-skola",
    targetLevel: "B2",
    seconds: 85,
    source: "claude",
    response:
      "Pracujem ako programátorka v menšej firme, ktorá vyvíja aplikácie pre nemocnice. Väčšinu dňa píšem kód, ale často sa stretávam aj s lekármi, aby som pochopila, čo presne potrebujú. Najviac ma baví, keď vidím, že náš systém naozaj ušetrí sestrám čas. Náročné je pre mňa to, že sa termíny často menia a niekedy musím všetko stihnúť za pár dní. Okrem toho sa ešte stále učím slovenčinu, takže porady sú pre mňa niekedy dosť vyčerpávajúce.",
    mutations: [
      { topic: "nounEndings", from: "s lekármi", to: "s lekári" },
      { topic: "functionWords", from: "aby som pochopila", to: "že som pochopila" },
      { topic: "adjectiveAgreement", from: "v menšej firme", to: "v menšom firme" },
      { topic: "wordOrder", from: "Najviac ma baví", to: "Ma najviac baví" },
      { topic: "verbForms", from: "porady sú", to: "porady je" },
      { topic: "vocabulary", from: "Okrem toho", to: "Kromě toho" },
    ],
  },
  {
    id: "ss-cesta-b1",
    kind: "speakingSample",
    promptId: "cesta",
    targetLevel: "B1",
    seconds: 120,
    source: "claude",
    response:
      "Rád spomínam na cestu do Chorvátska, keď som mal dvadsať rokov. Išli sme tam s kamarátmi starým autom môjho otca. Cesta trvala skoro dvanásť hodín, lebo sme sa dvakrát stratili a raz sa nám pokazilo auto. Nakoniec sme prišli k moru v noci a spali sme na pláži, lebo sme nenašli kemp. Ráno sme sa zobudili a pred nami bolo krásne modré more. Bolo to jednoduché a lacné, ale bola to najlepšia dovolenka v mojom živote.",
    mutations: [
      { topic: "nounEndings", from: "k moru", to: "k more" },
      { topic: "aspect", from: "sme prišli", to: "sme prichádzali" },
      { topic: "wordOrder", from: "lebo sme sa dvakrát", to: "lebo sa sme dvakrát" },
      { topic: "verbForms", from: "Cesta trvala", to: "Cesta trval" },
      { topic: "adjectiveAgreement", from: "krásne modré more", to: "krásny modré more" },
      { topic: "vocabulary", from: "najlepšia dovolenka", to: "najlepšia dovolená" },
    ],
  },
  {
    id: "ss-vynalez-b2",
    kind: "speakingSample",
    promptId: "vynalez",
    targetLevel: "B2",
    seconds: 150,
    source: "claude",
    response:
      "Za najdôležitejší vynález považujem elektrinu, aj keď vlastne nejde o jeden vynález, ale o celý rad objavov. Bez elektriny by sme nemali svetlo, chladničky, internet ani moderné nemocnice. Keď si predstavím, ako žili ľudia pred dvesto rokmi, uvedomím si, koľko vecí berieme ako samozrejmosť. Večer by sme sedeli pri sviečkach, jedlo by sa rýchlo kazilo a správy by sa šírili oveľa pomalšie. Na druhej strane by sme možno viac hovorili spolu a menej pozerali do obrazoviek. Ale úprimne, vrátiť sa do takého sveta by som nechcel.",
    mutations: [
      { topic: "nounEndings", from: "pri sviečkach", to: "pri sviečky" },
      { topic: "vocabulary", from: "nejde o jeden", to: "nejedná sa o jeden" },
      { topic: "aspect", from: "berieme ako", to: "zoberieme ako" },
      { topic: "wordOrder", from: "by som nechcel", to: "nechcel by som" },
      { topic: "adjectiveAgreement", from: "moderné nemocnice", to: "moderní nemocnice" },
      { topic: "functionWords", from: "ako žili", to: "čo žili" },
    ],
  },
  {
    id: "ss-stastie-c1",
    kind: "speakingSample",
    promptId: "stastie",
    targetLevel: "C1",
    seconds: 170,
    source: "claude",
    response:
      "Myslím si, že šťastie málokedy závisí od veľkých udalostí, ako je výhra v lotérii alebo povýšenie v práci. Výskumy, o ktorých som čítal, naznačujú, že ľudia si na takéto zmeny pomerne rýchlo zvyknú a po pár mesiacoch sú rovnako spokojní ako predtým. Omnoho väčší vplyv majú podľa mňa vzťahy, teda to, či máme okolo seba ľudí, na ktorých sa môžeme spoľahnúť. Napríklad môj starý otec nikdy nemal veľa peňazí, no keď sa u neho v nedeľu stretávala celá rodina, pôsobil ako najšťastnejší človek na svete. Okrem vzťahov je podľa mňa dôležitý aj pocit, že to, čo robíme, má zmysel. Ak niekto vidí, že jeho práca pomáha druhým, ľahšie znesie aj ťažšie obdobia.",
    mutations: [
      { topic: "vocabulary", from: "pomerne rýchlo", to: "poměrně rýchlo" },
      { topic: "nounEndings", from: "v lotérii", to: "v lotéria" },
      { topic: "aspect", from: "ľahšie znesie", to: "ľahšie bude zniesť" },
      { topic: "wordOrder", from: "na ktorých sa môžeme", to: "na ktorých môžeme sa" },
      {
        topic: "adjectiveAgreement",
        from: "najšťastnejší človek",
        to: "najšťastnejšia človek",
      },
    ],
  },
];
