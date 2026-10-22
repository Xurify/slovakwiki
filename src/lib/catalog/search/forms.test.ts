import { describe, expect, it } from "vitest";

import { conjugateVerbForTest, formsVerified, searchFormsForLemma } from "./forms";

describe("search forms", () => {
  it("shortens the ending after a long syllable", () => {
    expect(conjugateVerbForTest("čítať")).toEqual(
      expect.arrayContaining(["čítam", "čítaš", "číta", "čítajú"]),
    );
    expect(conjugateVerbForTest("čítať")).not.toContain("čítám");
    expect(conjugateVerbForTest("vrátiť")).toContain("vrátim");
    expect(conjugateVerbForTest("pôsobiť")).toContain("pôsobím");
    expect(conjugateVerbForTest("zúčastniť")).toContain("zúčastním");
  });

  it("gives -iam only to c and š stems", () => {
    expect(conjugateVerbForTest("vracať")).toContain("vraciam");
    expect(conjugateVerbForTest("volať")).toContain("volám");
    expect(conjugateVerbForTest("volať")).not.toContain("voliam");
  });

  it("conjugates -núť, -iať and -rieť verbs by their class", () => {
    expect(conjugateVerbForTest("minúť")).toEqual(
      expect.arrayContaining(["miniem", "minul"]),
    );
    expect(conjugateVerbForTest("stretnúť")).toEqual(
      expect.arrayContaining(["stretnem", "stretol", "stretla"]),
    );
    expect(conjugateVerbForTest("smiať")).toContain("smejem");
    expect(conjugateVerbForTest("pozrieť")).toEqual(
      expect.arrayContaining(["pozriem", "pozrú", "pozrel"]),
    );
  });

  it("keeps the irregular tables standard", () => {
    expect(conjugateVerbForTest("smieť")).toContain("smú");
    expect(conjugateVerbForTest("smieť")).not.toContain("smejú");
    expect(conjugateVerbForTest("hnať")).not.toContain("ženem");
    expect(conjugateVerbForTest("rásť")).toEqual(
      expect.arrayContaining(["rástol", "rástla"]),
    );
    expect(conjugateVerbForTest("klásť")).toContain("kládol");
    expect(conjugateVerbForTest("vyjsť")).toContain("vyjdú");
  });

  it("lists every past form of the irregular verbs", () => {
    expect(conjugateVerbForTest("sedieť")).toEqual(
      expect.arrayContaining(["sedel", "sedela", "sedelo", "sedeli"]),
    );
    expect(conjugateVerbForTest("ležať")).toEqual(
      expect.arrayContaining(["ležala", "ležalo", "ležali"]),
    );
    expect(conjugateVerbForTest("neprísť")).toContain("neprišli");
    expect(conjugateVerbForTest("užiť")).toContain("užili");
  });

  it("conjugates stavať as staviam", () => {
    expect(conjugateVerbForTest("stavať")).toEqual(
      expect.arrayContaining(["staviam", "staviaš", "stavia", "stavajú", "staval"]),
    );
    expect(conjugateVerbForTest("stavať")).not.toContain("stavám");
    expect(conjugateVerbForTest("stavať")).not.toContain("stavá");
    expect(conjugateVerbForTest("vystavať")).toContain("vystaviam");
  });

  it("conjugates verbs the generic rules got wrong", () => {
    expect(conjugateVerbForTest("chovať")).toContain("chovám");
    expect(conjugateVerbForTest("zachovať")).not.toContain("zachujem");
    expect(conjugateVerbForTest("spojiť")).toContain("spoja");
    expect(conjugateVerbForTest("spojiť")).not.toContain("spojia");
    expect(conjugateVerbForTest("využiť")).toContain("využijem");
    expect(conjugateVerbForTest("využiť")).not.toContain("využím");
    expect(conjugateVerbForTest("snažiť")).toContain("snažím");
    expect(conjugateVerbForTest("opísať")).toContain("opíšem");
    expect(conjugateVerbForTest("vypovedať")).toContain("vypovedám");
    expect(conjugateVerbForTest("neodpovedať")).toContain("neodpovedá");
    expect(conjugateVerbForTest("neodpovedať")).not.toContain("neodpoviem");
  });

  it("conjugates the prefixed verbs the search card shows", () => {
    expect(conjugateVerbForTest("dozvedieť")).toEqual(
      expect.arrayContaining(["dozviem", "dozvie", "dozvedia", "dozvedel"]),
    );
    expect(conjugateVerbForTest("nedozvedieť")).toContain("nedozviem");
    expect(conjugateVerbForTest("opísať")).toEqual(
      expect.arrayContaining(["opíšem", "opíšu", "opísal"]),
    );
    expect(conjugateVerbForTest("nepodpísať")).toContain("nepodpíšem");
    expect(conjugateVerbForTest("poukázať")).toContain("poukážem");
    expect(conjugateVerbForTest("preukázať")).toContain("preukážu");
    expect(conjugateVerbForTest("nenávidieť")).toEqual(
      expect.arrayContaining(["nenávidím", "nenávidia", "nenávidel"]),
    );
    expect(conjugateVerbForTest("oklamať")).toEqual(
      expect.arrayContaining(["oklamem", "oklamú"]),
    );
    expect(conjugateVerbForTest("oklamať")).not.toContain("oklamám");
    expect(conjugateVerbForTest("obrať")).toEqual(
      expect.arrayContaining(["oberiem", "oberú"]),
    );
    expect(conjugateVerbForTest("rozobrať")).toContain("rozoberiem");
  });

  it("declines soft -a feminines like ulica", () => {
    const gula = searchFormsForLemma("guľa", "Nouns", "feminine");
    expect(gula).toEqual(
      expect.arrayContaining(["gule", "guli", "guľu", "guľou", "guliam", "guliach"]),
    );
    expect(gula).not.toContain("guľy");
    expect(gula).not.toContain("guľe");

    const pracovna = searchFormsForLemma("pracovňa", "Nouns", "feminine");
    expect(pracovna).toEqual(
      expect.arrayContaining(["pracovne", "pracovni", "pracovniam", "pracovniach"]),
    );
    expect(pracovna).not.toContain("pracovňy");
    expect(pracovna).not.toContain("pracovňe");
    expect(pracovna).not.toContain("pracovňách");

    expect(searchFormsForLemma("chvíľa", "Nouns", "feminine")).toContain("chvíľam");
    expect(searchFormsForLemma("večera", "Nouns", "feminine")).toContain("večere");
  });

  it("applies the rhythmic law to hard -a feminines", () => {
    expect(searchFormsForLemma("stránka", "Nouns", "feminine")).toEqual(
      expect.arrayContaining(["stránkam", "stránkach"]),
    );
    expect(searchFormsForLemma("stránka", "Nouns", "feminine")).not.toContain(
      "stránkách",
    );
    expect(searchFormsForLemma("žena", "Nouns", "feminine")).toEqual(
      expect.arrayContaining(["ženy", "žene", "ženu", "ženou", "ženám", "ženách"]),
    );
  });

  it("declines feminines that end in a consonant as dlaň or kosť", () => {
    const naplne = searchFormsForLemma("náplň", "Nouns", "feminine");
    expect(naplne).toEqual(
      expect.arrayContaining(["náplne", "náplni", "náplňou", "náplniam"]),
    );
    expect(naplne).not.toContain("náplňa");
    expect(naplne).not.toContain("náplňom");

    const tlac = searchFormsForLemma("tlač", "Nouns", "feminine");
    expect(tlac).toEqual(expect.arrayContaining(["tlače", "tlači", "tlačou"]));
    expect(tlac).not.toContain("tlača");
    expect(tlac).not.toContain("tlačom");

    expect(searchFormsForLemma("radosť", "Nouns", "feminine")).toEqual(
      expect.arrayContaining(["radosti", "radosťou"]),
    );
    expect(searchFormsForLemma("pieseň", "Nouns", "feminine")).toEqual(
      expect.arrayContaining(["piesne", "piesňou", "piesňam"]),
    );
    expect(searchFormsForLemma("nádej", "Nouns", "feminine")).toContain("nádejam");
  });

  it("gives masculine animate nouns -ovi and a softened plural", () => {
    const vinnik = searchFormsForLemma("vinník", "Nouns", "masculine-animate");
    expect(vinnik).toEqual(
      expect.arrayContaining(["vinníka", "vinníkovi", "vinníkom", "vinníci"]),
    );
    expect(vinnik).not.toContain("vinníku");

    expect(searchFormsForLemma("technik", "Nouns", "masculine-animate")).toEqual(
      expect.arrayContaining(["technici", "technikovi"]),
    );
    expect(searchFormsForLemma("učiteľ", "Nouns", "masculine-animate")).toContain(
      "učitelia",
    );
    expect(searchFormsForLemma("kolega", "Nouns", "masculine-animate")).toEqual(
      expect.arrayContaining(["kolegu", "kolegovi", "kolegovia"]),
    );
  });

  it("gives masculine inanimate nouns genitive -u unless they take -a", () => {
    const odraz = searchFormsForLemma("odraz", "Nouns", "masculine-inanimate");
    expect(odraz).toEqual(expect.arrayContaining(["odrazu", "odraze", "odrazy"]));
    expect(odraz).not.toContain("odraza");

    expect(searchFormsForLemma("jazyk", "Nouns", "masculine-inanimate")).toContain(
      "jazyka",
    );
    expect(searchFormsForLemma("stroj", "Nouns", "masculine-inanimate")).toEqual(
      expect.arrayContaining(["stroja", "stroji", "stroje"]),
    );
    expect(searchFormsForLemma("koniec", "Nouns", "masculine-inanimate")).toContain(
      "konca",
    );
    expect(searchFormsForLemma("západ", "Nouns", "masculine-inanimate")).toContain(
      "západe",
    );
  });

  it("drops the o of -ok only where Slovak does", () => {
    expect(searchFormsForLemma("výsledok", "Nouns", "masculine-inanimate")).toContain(
      "výsledku",
    );
    expect(searchFormsForLemma("útok", "Nouns", "masculine-inanimate")).toContain(
      "útoku",
    );
    const notebook = searchFormsForLemma("notebook", "Nouns", "masculine-inanimate");
    expect(notebook).toEqual(
      expect.arrayContaining(["notebooku", "notebookom", "notebooky", "notebookmi"]),
    );
    expect(notebook).not.toContain("noteboku");
  });

  it("gives a noun without a gender both genitives", () => {
    expect(searchFormsForLemma("robot", "Nouns")).toEqual(
      expect.arrayContaining(["robota", "robotu"]),
    );
    expect(searchFormsForLemma("župan", "Nouns")).toContain("župana");
    expect(searchFormsForLemma("Prešov", "Places")).toContain("prešova");
  });

  it("declines a common noun filed under Places", () => {
    expect(searchFormsForLemma("mesto", "Places")).toEqual(
      expect.arrayContaining(["meste", "mestá", "mestách"]),
    );
    expect(searchFormsForLemma("Bratislava", "Places")).not.toContain("bratislavách");
  });

  it("declines short masculine nouns such as pás and cit", () => {
    expect(searchFormsForLemma("pás", "Nouns", "masculine-inanimate")).toEqual(
      expect.arrayContaining(["pása", "pásu", "páse", "pásom", "pásy"]),
    );
    expect(searchFormsForLemma("cit", "Nouns", "masculine-inanimate")).toEqual(
      expect.arrayContaining(["citu", "cite", "citom", "city"]),
    );
  });

  it("gives neuters their plural and locative", () => {
    expect(searchFormsForLemma("pravidlo", "Nouns", "neuter")).toEqual(
      expect.arrayContaining(["pravidla", "pravidle", "pravidlá", "pravidlách"]),
    );
    expect(searchFormsForLemma("ihrisko", "Nouns", "neuter")).toEqual(
      expect.arrayContaining(["ihrisku", "ihriská"]),
    );
    expect(searchFormsForLemma("pole", "Nouns", "neuter")).toEqual(
      expect.arrayContaining(["poľa", "poli", "polia"]),
    );
  });

  it("declines adjectives in short -y after a long syllable", () => {
    expect(searchFormsForLemma("francúzsky", "Adjectives")).toEqual(
      expect.arrayContaining(["francúzska", "francúzskeho", "francúzskom", "francúzsku"]),
    );
    expect(searchFormsForLemma("taliansky", "Adjectives")).toEqual(
      expect.arrayContaining(["talianska", "talianske", "talianskeho"]),
    );
    expect(searchFormsForLemma("krásny", "Adjectives")).toEqual(
      expect.arrayContaining(["krásna", "krásne", "krásneho", "krásnou", "krásnych"]),
    );
    expect(searchFormsForLemma("nemecký", "Adjectives")).toEqual(
      expect.arrayContaining(["nemecká", "nemeckého", "nemeckú", "nemeckou"]),
    );
  });

  it("declines adjectives in short -i after a long syllable", () => {
    const domaci = searchFormsForLemma("domáci", "Adjectives");
    expect(domaci).toEqual(
      expect.arrayContaining(["domáca", "domáce", "domáceho", "domácemu", "domácu"]),
    );
    expect(domaci).not.toContain("domácia");
    expect(domaci).not.toContain("domácieho");
    expect(searchFormsForLemma("budúci", "Adjectives")).toContain("budúceho");
    expect(searchFormsForLemma("horúci", "Adjectives")).toContain("horúcu");
    expect(searchFormsForLemma("vynikajúci", "Adjectives")).toContain("vynikajúcich");
  });

  it("verifies only the paradigms it builds correctly", () => {
    expect(formsVerified("kupovať", "Verbs")).toBe(true);
    expect(formsVerified("robiť", "Verbs")).toBe(true);
    expect(formsVerified("brať", "Verbs")).toBe(true);
    expect(formsVerified("stavať", "Verbs")).toBe(true);
    for (const verb of [
      "dozvedieť",
      "nedozvedieť",
      "opísať",
      "nepodpísať",
      "poukázať",
      "preukázať",
      "nenávidieť",
      "oklamať",
      "obrať",
      "rozobrať",
    ]) {
      expect(formsVerified(verb, "Verbs")).toBe(true);
    }
    expect(formsVerified("čítať", "Verbs")).toBe(false);
    expect(formsVerified("nový", "Adjectives")).toBe(true);
    expect(formsVerified("krásny", "Adjectives")).toBe(true);
    expect(formsVerified("francúzsky", "Adjectives")).toBe(true);
    for (const adjective of ["domáci", "budúci", "horúci", "vynikajúci"]) {
      expect(formsVerified(adjective, "Adjectives")).toBe(true);
    }
    expect(formsVerified("sexy", "Adjectives")).toBe(false);
    expect(formsVerified("kniha", "Nouns", "feminine")).toBe(true);
    expect(formsVerified("mesto", "Nouns", "neuter")).toBe(true);
    expect(formsVerified("ulica", "Nouns", "feminine")).toBe(true);
    expect(formsVerified("guľa", "Nouns", "feminine")).toBe(true);
    expect(formsVerified("káva", "Nouns", "feminine")).toBe(false);
    expect(formsVerified("náplň", "Nouns", "feminine")).toBe(false);
    expect(formsVerified("kolega", "Nouns", "masculine-animate")).toBe(false);
    expect(formsVerified("pes", "Nouns", "masculine-animate")).toBe(false);
    expect(formsVerified("odraz", "Nouns", "masculine-inanimate")).toBe(false);
  });
});
