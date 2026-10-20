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
];
