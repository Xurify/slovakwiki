import { describe, expect, it } from "vitest";

import { isOutdoors } from "./places";
import { clockHour, sceneMood, toldHour } from "./scene-mood";

describe("sceneMood", () => {
  it("reads the time of day from the first greeting that names one", () => {
    expect(sceneMood(["Dobrý deň.", "Dobrý večer, pani Mária."]).time).toBe("evening");
    expect(sceneMood(["Dobré ráno! Ako sa máš?"]).time).toBe("morning");
    expect(sceneMood(["Ďakujem. Dobrú noc."]).time).toBe("day");
    expect(sceneMood(["Dobrú noc, mama."]).time).toBe("night");
    expect(sceneMood(["Dnes večer ide do kina."]).time).toBe("day");
    expect(sceneMood(["Sobota. Šesť hodín večer."]).time).toBe("evening");
    expect(sceneMood(["Park. Pol deviatej ráno."]).time).toBe("morning");
    expect(sceneMood(["Príde o šiestej hodín večer."]).time).toBe("day");
  });

  it("hears rain and snow in any form, and nothing in words that only look alike", () => {
    expect(sceneMood(["Vonku prší."]).weather).toBe("rain");
    expect(sceneMood(["Máš dáždnik?"]).weather).toBe("rain");
    expect(sceneMood(["Pozri, sneží!"]).weather).toBe("snow");
    expect(sceneMood(["Je tu veľa snehu."]).weather).toBe("snow");
    expect(sceneMood(["Dobrý deň. Dáte si kávu?"]).weather).toBe("clear");
  });

  it("changes the sky line by line, as the words name the weather", () => {
    const lines = [
      "Pekné. Svieti slnko a je teplo.",
      "Áno. Ale pozri, prichádzajú oblaky.",
      "Áno. A teraz prší!",
      "Pozri! Sneží!",
      "Slnko, oblaky, dážď, sneh. Za jednu hodinu.",
      "To je Bratislava. Poďme domov!",
    ];
    expect(lines.map((_, at) => sceneMood(lines, at).weather)).toEqual([
      "sunny",
      "cloudy",
      "rain",
      "snow",
      "snow",
      "snow",
    ]);
    expect(sceneMood(["Prší!", "Už svieti slnko."]).weather).toBe("sunny");
    expect(sceneMood(["Je oblačno."]).weather).toBe("cloudy");
    expect(sceneMood(["Prší!", "Poďme."], 2).weather).toBe("cloudy");
    expect(sceneMood(["Sneží!"], 1).weather).toBe("cloudy");
    expect(sceneMood(["Svieti slnko."], 1).weather).toBe("sunny");
  });

  it("knows which places are under the sky", () => {
    const places = ["plaza", "market", "default", "cafe", "home"] as const;
    expect(places.map((place) => isOutdoors(place))).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });
});

describe("toldHour", () => {
  it("reads the time a scene card or a line tells", () => {
    expect(toldHour(["Staré mesto. Pol dvanástej."])).toBe(11.5);
    expect(toldHour(["Haló?", "Je sedem hodín, vstávaj!"])).toBe(7);
    expect(toldHour(["Je štvrť na deväť."])).toBe(8.25);
    expect(toldHour(["Je poludnie."])).toBe(0);
  });

  it("leaves out a time something happens at, and a bare number", () => {
    expect(toldHour(["O dvanástej ide von."])).toBeUndefined();
    expect(toldHour(["Príde o pol hodiny."])).toBeUndefined();
    expect(toldHour(["Mám sedem jabĺk."])).toBeUndefined();
  });

  it("takes the time of day a line says it is", () => {
    expect(sceneMood(["Anna, je ešte skoro ráno."]).time).toBe("morning");
    expect(sceneMood(["Je ráno a sme späť v štúdiu."]).time).toBe("morning");
    expect(sceneMood(["Prepáčte, je ešte strašne skoro."]).time).toBe("morning");
    expect(sceneMood(["Zajtra ráno poďme skoro."]).time).toBe("day");
  });

  it("sets the clocks, and the time of day's hour holds when no time is told", () => {
    expect(clockHour(sceneMood(["Trh. Pol piatej."]))).toBe(4.5);
    expect(clockHour(sceneMood(["Dobrý večer!"]))).toBe(19);
  });
});
