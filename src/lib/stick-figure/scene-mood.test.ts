import { describe, expect, it } from "vitest";

import { isOutdoors } from "./places";
import { sceneMood } from "./scene-mood";

describe("sceneMood", () => {
  it("reads the time of day from the first greeting that names one", () => {
    expect(sceneMood(["Dobrý deň.", "Dobrý večer, pani Mária."]).time).toBe("evening");
    expect(sceneMood(["Dobré ráno! Ako sa máš?"]).time).toBe("morning");
    expect(sceneMood(["Ďakujem. Dobrú noc."]).time).toBe("day");
    expect(sceneMood(["Dobrú noc, mama."]).time).toBe("night");
    expect(sceneMood(["Dnes večer ide do kina."]).time).toBe("day");
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
