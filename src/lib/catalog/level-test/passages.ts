import type { CefrLevel } from "$lib/level-test/scale";

/**
 * Read and Complete source passages, written to a target CEFR level the way
 * the DET's expert-written passages were. Gaps are cut by `damagePassage` when
 * the bank is built: keep the first and last sentences free of anything a
 * learner must produce, and keep names capitalized so they are never cut.
 */
export interface CTestPassage {
  id: string;
  level: CefrLevel;
  title: string;
  text: string;
}

export const ctestPassages: CTestPassage[] = [
  {
    id: "moja-rodina",
    level: "A1",
    title: "Moja rodina",
    text: "Volám sa Peter a mám tridsať rokov. Bývam v Bratislave s manželkou a dvoma deťmi. Moja manželka sa volá Eva a pracuje v nemocnici. Náš syn má osem rokov a chodí do školy. Dcéra je ešte malá a je doma s babkou. Večer spolu večeriame a rozprávame sa. V sobotu chodíme do parku.",
  },
  {
    id: "moj-den",
    level: "A1",
    title: "Môj deň",
    text: "Každý deň vstávam o siedmej. Najprv sa osprchujem a potom raňajkujem. Na raňajky mám chlieb s maslom a čaj. Do práce chodím autobusom, lebo nemám auto. V práci som do štvrtej. Potom idem do obchodu a kúpim niečo na večeru. Večer čítam alebo pozerám televíziu.",
  },
  {
    id: "v-kaviarni",
    level: "A1",
    title: "Naša kaviareň",
    text: "Na našej ulici je malá kaviareň. Chodím tam často s kamarátmi. Kaviareň má veľké okná a pekné stoly. Káva je tam dobrá a nie je drahá. Majú aj čaj, džús a koláče. Najradšej mám jablkový koláč. Je to moje obľúbené miesto.",
  },
  {
    id: "nas-pes",
    level: "A1",
    title: "Náš pes",
    text: "Náš pes sa volá Max a má päť rokov. Je veľký, čierny a veľmi priateľský. Každé ráno s ním chodím na prechádzku do parku. Rád behá po tráve a hrá sa s loptou. Potom je hladný a pije veľa vody. Doma spí pri okne alebo pod stolom. Max je pre nás ako člen rodiny.",
  },
  {
    id: "moj-vikend",
    level: "A1",
    title: "Môj víkend",
    text: "Cez víkend nemusím ísť do práce. V sobotu dlho spím a raňajkujem až o desiatej. Potom upratujem byt a idem na nákup. Poobede chodím s kamarátmi do mesta. Niekedy ideme do kina alebo na koncert. V nedeľu obedujem u rodičov a mama vždy varí niečo dobré. Večer už odpočívam, lebo v pondelok skoro vstávam.",
  },
  {
    id: "moje-mesto",
    level: "A1",
    title: "Moje mesto",
    text: "Bývam v malom meste na východe Slovenska. Mesto má pekné námestie a starý kostol. Na námestí sú obchody, kaviarne a jedna reštaurácia. Pri rieke je park, kde sa hrajú deti. V meste máme aj školu, poštu a malú nemocnicu. Ľudia sa tu poznajú a na ulici sa zdravia. Mám to tu veľmi rád.",
  },
  {
    id: "moja-kamaratka",
    level: "A1",
    title: "Moja kamarátka",
    text: "Moja najlepšia kamarátka sa volá Lucia. Poznáme sa zo školy a teraz bývame blízko seba. Pracuje v knižnici, lebo má rada knihy. Má dlhé vlasy a nosí okuliare. Vo voľnom čase rada pečie koláče. Často spolu pijeme kávu a rozprávame sa o všetkom. Keď mám problém, vždy mi pomôže.",
  },
  {
    id: "vylet-do-tatier",
    level: "A2",
    title: "Výlet do Tatier",
    text: "Minulé leto sme boli s rodinou v Tatrách. Bývali sme v malom hoteli blízko Štrbského Plesa. Každé ráno sme chodili na túru do hôr. Počasie bolo väčšinou pekné, ale raz celý deň pršalo. Vtedy sme zostali v hoteli a hrali sme karty. Deti sa najviac tešili na jazero, kde sme sa mohli člnkovať. Na budúci rok tam chceme ísť znova.",
  },
  {
    id: "novy-byt",
    level: "A2",
    title: "Nový byt",
    text: "Minulý mesiac som sa presťahovala do nového bytu. Byt je na treťom poschodí a má dve izby. Z balkóna vidím park a kostol. Kuchyňa je malá, ale je v nej všetko, čo potrebujem. Najviac sa mi páči obývačka, lebo je svetlá. Susedia sú milí a často sa so mnou rozprávajú. Teraz sa konečne cítim ako doma.",
  },
  {
    id: "na-trhu",
    level: "A2",
    title: "Na trhu",
    text: "Volám sa Jana a v sobotu ráno chodím na trh. Kupujem tam zeleninu, ovocie a niekedy aj syr. Na trhu je všetko čerstvé a predavači sú veľmi príjemní. Minulý týždeň som kúpila jahody a zemiaky. Jedna predavačka mi dala zadarmo aj trochu petržlenu. Doma som potom uvarila polievku. Trh mám radšej ako veľký supermarket.",
  },
  {
    id: "strateny-kufor",
    level: "A2",
    title: "Stratený kufor",
    text: "Minulé leto som letel na dovolenku do Španielska. Po prílete som dlho čakal na kufor, ale neprišiel. Išiel som teda do kancelárie a všetko som vysvetlil. Pani za pultom mi povedala, že kufor zostal v Bratislave. Musel som si kúpiť nové tričko, plavky a zubnú kefku. Kufor prišiel do hotela až na tretí deň. Odvtedy si do lietadla vždy beriem aj náhradné oblečenie.",
  },
  {
    id: "kurz-varenia",
    level: "A2",
    title: "Kurz varenia",
    text: "Dlho som nevedela variť, a preto som často jedla v reštauráciách. Minulú jeseň som sa prihlásila na kurz varenia. Kurz bol vždy vo štvrtok večer a trval dva mesiace. Naučili sme sa piecť chlieb a variť jednoduché polievky. Najviac ma bavilo robiť domáce cestoviny. Raz som pozvala kamarátov na večeru a všetko im chutilo. Teraz varím doma takmer každý deň a šetrím tak peniaze.",
  },
  {
    id: "prvy-den-v-praci",
    level: "A2",
    title: "Prvý deň v práci",
    text: "Minulý pondelok som začal pracovať v novej firme. Ráno som vstal skôr, lebo som nechcel meškať. Do kancelárie som prišiel už o pol ôsmej. Šéfka mi ukázala môj stôl a predstavila ma kolegom. Všetci boli milí a na obed sme išli spolu. Poobede som sa učil pracovať s novým programom. Večer som bol unavený, ale aj veľmi spokojný.",
  },
  {
    id: "u-lekara",
    level: "A2",
    title: "U lekára",
    text: "Minulý týždeň som ochorela. V utorok ráno ma bolela hlava a mala som horúčku. Zavolala som do práce, že neprídem, a išla som k lekárke. Lekárka mi zmerala teplotu a pozrela sa mi do hrdla. Povedala, že mám chrípku a musím zostať doma. Celý týždeň som ležala v posteli a pila čaj s medom. Teraz som už zdravá a znova chodím do práce.",
  },
  {
    id: "praca-z-domu",
    level: "B1",
    title: "Práca z domu",
    text: "Mnoho ľudí dnes pracuje z domu. Pre niektorých je to veľká výhoda, pretože nemusia každý deň cestovať do kancelárie. Ušetria tak čas aj peniaze. Na druhej strane však práca z domu prináša aj problémy. Človek sa môže cítiť osamelý a je ťažšie oddeliť prácu od súkromného života. Preto odborníci odporúčajú mať doma vyhradené miesto na prácu a pravidelný denný režim. Najlepšie je, keď sa práca z domu strieda s prácou v kancelárii.",
  },
  {
    id: "slovenske-hrady",
    level: "B1",
    title: "Slovenské hrady",
    text: "Na Slovensku je veľa hradov a zámkov. Mnohé z nich vznikli v stredoveku na ochranu obchodných ciest a hraníc krajiny. Najznámejší je Spišský hrad, ktorý patrí k najväčším hradným komplexom v strednej Európe. Dnes sú z mnohých hradov len ruiny, no niektoré sa podarilo opraviť. Dobrovoľníci každé leto pomáhajú pri ich obnove. Vďaka nim sa hrady stávajú obľúbeným cieľom turistov. Návšteva hradu je dobrý spôsob, ako spoznať históriu krajiny.",
  },
  {
    id: "pohyb-a-zdravie",
    level: "B1",
    title: "Pohyb a zdravie",
    text: "Pravidelný pohyb je dôležitý pre zdravie. Lekári odporúčajú aspoň tridsať minút pohybu denne. Nemusí to byť náročný šport, stačí aj rýchla prechádzka alebo jazda na bicykli. Pohyb zlepšuje náladu a pomáha lepšie spať. Mnohí ľudia však tvrdia, že na šport nemajú čas. Pritom stačí ísť do práce pešo alebo používať schody namiesto výťahu. Malé zmeny v každodennom živote môžu mať veľký účinok.",
  },
  {
    id: "socialne-siete",
    level: "B1",
    title: "Sociálne siete",
    text: "Sociálne siete dnes používa takmer každý mladý človek. Pomáhajú nám zostať v kontakte s priateľmi, ktorí bývajú ďaleko. Okrem toho na nich môžeme rýchlo nájsť zaujímavé informácie. Majú však aj nevýhody. Mnohí ľudia na nich trávia niekoľko hodín denne a potom im chýba čas na iné veci. Niektorí sa navyše stále porovnávajú s ostatnými a sú nespokojní so svojím životom. Podľa mňa je dôležité používať ich rozumne a občas si dať pauzu.",
  },
  {
    id: "zivot-na-dedine",
    level: "B1",
    title: "Život na dedine",
    text: "Už tri roky bývame s manželom na dedine neďaleko Nitry. Mnohí známi nechápali, prečo sme odišli z mesta. My sme chceli žiť v pokoji a bližšie k prírode. Deti sa môžu celý deň hrať vonku a máme vlastnú záhradu. Život na dedine má však aj nevýhody. Do práce musíme dochádzať autom, pretože autobus tu chodí len niekoľkokrát denne. Napriek tomu si myslím, že sme sa rozhodli správne.",
  },
  {
    id: "byvanie-s-rodicmi",
    level: "B1",
    title: "Bývanie s rodičmi",
    text: "Na Slovensku žije veľa mladých ľudí s rodičmi aj po skončení školy. Hlavným dôvodom sú vysoké ceny bytov a nájmov. Niektorí si chcú najprv našetriť na vlastné bývanie. Bývanie s rodičmi má určite výhody, pretože človek nemusí platiť nájom a nie je sám. Mladí ľudia však často chcú byť samostatní a rozhodovať o svojom živote. Ak zostanú doma príliš dlho, neskôr sa ťažšie osamostatnia. Dôležité je, aby sa celá rodina dohodla na jasných pravidlách.",
  },
  {
    id: "domace-ulohy",
    level: "B1",
    title: "Domáce úlohy",
    text: "O domácich úlohách sa medzi rodičmi a učiteľmi často diskutuje. Niektorí si myslia, že úlohy pomáhajú deťom zopakovať si učivo. Žiaci sa tak naučia pracovať samostatne a plánovať si čas. Iní však tvrdia, že deti majú po vyučovaní málo času na hru a šport. Ak je úloh príliš veľa, deti sú unavené a strácajú chuť do učenia. Podľa mňa by úlohy mali byť krátke a zaujímavé. Viac úloh totiž neznamená lepšie výsledky.",
  },
  {
    id: "mesta-a-auta",
    level: "B2",
    title: "Mestá bez áut?",
    text: "V mnohých európskych mestách sa v posledných rokoch mení prístup k doprave. Radnice obmedzujú vjazd áut do centra a investujú do cyklotrás a verejnej dopravy. Zástancovia týchto opatrení tvrdia, že vzduch je čistejší a ulice bezpečnejšie. Kritici naopak upozorňujú, že obmedzenia komplikujú život ľuďom, ktorí dochádzajú z okolitých obcí. Podľa nich by mesto malo najskôr zabezpečiť kvalitné spojenie a parkoviská na okraji. Diskusia ukazuje, že dopravná politika je vždy kompromisom medzi rôznymi záujmami. Jednoduché riešenie, ktoré by vyhovovalo všetkým, zrejme neexistuje.",
  },
  {
    id: "citanie-na-obrazovke",
    level: "B2",
    title: "Čítanie na obrazovke",
    text: "Hoci dnes čítame viac textov než kedykoľvek predtým, mnohí odborníci sa obávajú, že strácame schopnosť sústredeného čítania. Na obrazovke totiž texty väčšinou len rýchlo prebehneme očami a hľadáme kľúčové slová. Takéto čítanie je užitočné, keď potrebujeme rýchlo nájsť informáciu. Pri náročnejších textoch však vedie k tomu, že im rozumieme len povrchne. Výskumy naznačujú, že tlačený text si zapamätáme o niečo lepšie ako text na displeji. Nie je to však dôvod vzdať sa technológií, skôr by sme mali vedome striedať oba spôsoby čítania. Rozhodujúce je, či čítaniu venujeme plnú pozornosť.",
  },
  {
    id: "dobrovolnictvo",
    level: "B2",
    title: "Dobrovoľníctvo",
    text: "Dobrovoľníctvo má na Slovensku dlhú tradíciu, no v posledných rokoch získava nové podoby. Kým v minulosti išlo najmä o pomoc v rámci obce alebo farnosti, dnes sa ľudia zapájajú aj do projektov v zahraničí. Mladí dobrovoľníci často hovoria, že im táto skúsenosť pomohla nájsť smer v živote. Okrem toho sa naučia pracovať v tíme a riešiť nečakané situácie. Organizácie, ktoré dobrovoľníkov vysielajú, však zdôrazňujú, že dobrá vôľa nestačí. Kľúčová je dôkladná príprava a rešpekt k miestnym ľuďom. Len tak môže pomoc skutočne priniesť úžitok obom stranám.",
  },
  {
    id: "prilis-vela-turistov",
    level: "B2",
    title: "Príliš veľa turistov",
    text: "Turizmus prináša mnohým regiónom prácu a peniaze, no jeho rýchly rast má aj tienisté stránky. V obľúbených mestách sa v sezóne tlačia davy návštevníkov. Miestni obyvatelia sa sťažujú na hluk, odpad a vyššie ceny bývania. Mnohé byty v centre sa totiž menia na ubytovanie pre turistov. Trpí aj príroda, najmä v horách, kde ľudia schádzajú z chodníkov a rušia zvieratá. Niektoré miesta preto zavádzajú poplatky alebo obmedzujú počet návštevníkov. Cieľom nie je turistov odradiť, ale nájsť rovnováhu medzi ich záujmami a kvalitou života obyvateľov.",
  },
  {
    id: "plytvanie-jedlom",
    level: "B2",
    title: "Plytvanie jedlom",
    text: "Hoci mnoho ľudí na svete trpí hladom, v bohatých krajinách končí veľká časť jedla v koši. Najviac potravín sa pritom nevyhadzuje v obchodoch, ale v domácnostiach. Často kupujeme viac, než dokážeme zjesť, a zabúdame na jedlo v chladničke. Problémom nie sú len vyhodené potraviny, ale aj voda a energia, ktoré sa spotrebovali pri ich výrobe. Odborníci preto radia plánovať nákupy a správne skladovať jedlo. Niektoré obchody zas darujú tovar tesne pred koncom trvanlivosti charitatívnym organizáciám. Keby každá domácnosť nakupovala o niečo uvážlivejšie, odpadu by bolo podstatne menej.",
  },
  {
    id: "starnuca-spolocnost",
    level: "B2",
    title: "Starnúca spoločnosť",
    text: "Slovensko, podobne ako väčšina európskych krajín, rýchlo starne. Ľudia sa dožívajú vyššieho veku a zároveň sa rodí menej detí. Tento vývoj prináša spoločnosti viacero výziev. Na dôchodky a zdravotnú starostlivosť bude treba stále viac peňazí, pričom pracujúcich ubúda. Chýbať budú aj opatrovatelia, ktorí by sa starali o seniorov odkázaných na pomoc. Starnutie však neznamená len problémy, keďže mnohí starší ľudia zostávajú dlho aktívni. Môžu odovzdávať skúsenosti mladším kolegom, pomáhať v rodine alebo sa zapájať do života v obci. Úlohou politiky je vytvoriť podmienky, aby tento potenciál nezostal nevyužitý.",
  },
  {
    id: "veda-a-verejnost",
    level: "B2",
    title: "Veda a verejnosť",
    text: "Od vedcov sa dnes čoraz častejšie očakáva, že budú o svojej práci hovoriť aj s verejnosťou. Ľudia totiž chcú vedieť, na čo sa používajú peniaze z daní. Okrem toho môže zrozumiteľné vysvetlenie pomôcť v boji proti nepravdivým informáciám. Pre mnohých výskumníkov však nie je jednoduché hovoriť bez odborných pojmov. Zložité výsledky musia zjednodušiť, no zároveň nesmú skresliť ich význam. Univerzity preto organizujú kurzy, na ktorých sa vedci učia písať pre bežných čitateľov. Obľúbené sú aj vedecké kaviarne či festivaly, kde sa môžu návštevníci s vedcami priamo porozprávať.",
  },
  {
    id: "jazyk-a-identita",
    level: "C1",
    title: "Jazyk a identita",
    text: "Jazyk nie je iba nástrojom komunikácie, ale aj dôležitou súčasťou identity. Pre Slovákov zohrala spisovná slovenčina kľúčovú úlohu v období národného obrodenia, keď sa formovalo moderné národné povedomie. Kodifikácie spisovnej slovenčiny, ktoré vypracovali Anton Bernolák a neskôr Ľudovít Štúr, však neboli iba lingvistickou otázkou. Spory o podobu spisovnej normy odrážali hlbšie názorové rozdiely v spoločnosti. Dnes sa diskusie presúvajú k otázkam vplyvu angličtiny a digitálnej komunikácie na súčasný jazyk. Zatiaľ čo niektorí vnímajú prenikanie anglicizmov ako ohrozenie, iní v ňom vidia prirodzený prejav jazykového vývoja. Jazyk sa totiž vždy menil spolu so spoločnosťou, ktorá ho používa.",
  },
  {
    id: "sucho-a-poda",
    level: "C1",
    title: "Sucho a pôda",
    text: "Klimatická zmena sa na Slovensku prejavuje čoraz výraznejšie, a to nielen v podobe horúcich letných mesiacov. Poľnohospodári čelia dlhším obdobiam sucha, ktoré striedajú prudké lejaky, pri ktorých pôda nestihne vodu zadržať. Dôsledkom sú nižšie úrody a erózia pôdy, ktorá sa v niektorých regiónoch stáva vážnym problémom. Odborníci preto odporúčajú prechod na odolnejšie plodiny a šetrnejšie spôsoby obrábania pôdy. Dôležitú úlohu zohráva aj obnova mokradí a remízok, ktoré pomáhajú zadržiavať vodu v krajine. Takéto zmeny si však vyžadujú investície a ochotu meniť zaužívané postupy. Bez systematickej podpory zo strany štátu sa preto presadzujú len pomaly.",
  },
  {
    id: "dezinformacie",
    level: "C1",
    title: "Dezinformácie",
    text: "Šírenie dezinformácií nie je novým javom, no sociálne siete ho výrazne urýchlili. Algoritmy uprednostňujú obsah, ktorý vyvoláva silné emócie, a nepravdivé tvrdenia sa preto šíria rýchlejšie než ich vyvrátenie. Výskumy naznačujú, že ľudia ľahšie uveria informácii, ktorá potvrdzuje ich doterajšie presvedčenie. Samotné uvádzanie vecí na pravú mieru často nestačí, najmä ak prichádza neskoro. Odborníci sa čoraz viac zameriavajú na prevenciu, teda na rozvoj mediálnej gramotnosti. Ukazuje sa, že ak ľudia vopred poznajú typické manipulačné techniky, dokážu ich neskôr ľahšie rozpoznať. Kritické myslenie tak nemožno chápať ako výsadu vzdelanej menšiny, ale ako základnú zručnosť každého občana.",
  },
  {
    id: "stvordnovy-pracovny-tyzden",
    level: "C1",
    title: "Štvordňový pracovný týždeň",
    text: "Myšlienka štvordňového pracovného týždňa sa v posledných rokoch presunula z okraja diskusie do jej centra. Viaceré firmy v zahraničí už takýto režim vyskúšali a uvádzajú, že produktivita zamestnancov neklesla, ba v niektorých prípadoch dokonca vzrástla. Zamestnanci sa zároveň cítili menej vyčerpaní a ľahšie zosúlaďovali prácu so súkromným životom. Kritici však upozorňujú, že výsledky pilotných projektov nemožno jednoducho zovšeobecniť. Zapojili sa do nich prevažne firmy, ktoré o zmenu stáli. V zdravotníctve či v nepretržitých prevádzkach by si takýto model navyše vyžadoval viac personálu, ktorého je už teraz nedostatok. Kratší týždeň tak zrejme nebude univerzálnym riešením, skôr možnosťou pre vybrané odvetvia.",
  },
  {
    id: "odliv-mozgov",
    level: "C1",
    title: "Odliv mozgov",
    text: "Slovensko patrí ku krajinám, z ktorých odchádza do zahraničia veľa mladých a vzdelaných ľudí. Mnohí z nich odídu študovať a po skončení školy sa už nevrátia. Lákajú ich nielen vyššie platy, ale aj lepšie podmienky na výskum a kariérny rast. Krajina tak prichádza o ľudí, ktorých vzdelanie financovala z verejných zdrojov. Odborníci však upozorňujú, že pobyt v zahraničí nemusí byť stratou. Ak sa ľudia neskôr vrátia so skúsenosťami a kontaktmi, môžu doma presadiť nové postupy. Otázkou preto nie je, ako odchodom zabrániť, ale ako vytvoriť podmienky, za ktorých sa návrat oplatí.",
  },
  {
    id: "pamiatky-a-rozvoj-miest",
    level: "C1",
    title: "Pamiatky a rozvoj miest",
    text: "Historické centrá miest sú svedectvom minulosti, no zároveň musia slúžiť ľuďom, ktorí v nich žijú dnes. Ochrana pamiatok sa preto často dostáva do konfliktu s požiadavkami moderného života. Majitelia starých domov sa sťažujú, že prísne predpisy im bránia vymeniť okná či zatepliť fasádu. Pamiatkari naopak namietajú, že necitlivé zásahy by nenávratne narušili ráz celých ulíc. Spor sa neraz zužuje na zdanlivú voľbu medzi zachovaním a pokrokom. Viaceré príklady zo zahraničia však ukazujú, že citlivá obnova dokáže spojiť obe hodnoty. Staré budovy možno prispôsobiť súčasným potrebám bez toho, aby stratili svoj charakter. Predpokladom je včasný dialóg medzi vlastníkmi, úradmi a odborníkmi.",
  },
];
