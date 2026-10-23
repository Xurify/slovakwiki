import { describe, expect, it } from "vitest";

import { DAY_VISITS, dayAnswer, dayTurns } from "./scene-day";
import { isOutdoors, sceneMood } from "./scene-mood";

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

describe("a day on the square", () => {
  it("greets each person, talks, and sees them off, with one line that fits each time", () => {
    const ids = DAY_VISITS.flatMap((visit) => visit.exchanges.map(({ id }) => id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const visit of DAY_VISITS) {
      expect(visit.exchanges).toHaveLength(3);
      for (const exchange of visit.exchanges) {
        expect(exchange.choices).toHaveLength(3);
        expect(exchange.choices.filter((choice) => !choice.why)).toHaveLength(1);
        expect(new Set(exchange.choices.map((choice) => choice.slovak)).size).toBe(3);
      }
    }
  });

  it("never takes Dobrú noc as a hello", () => {
    for (const visit of DAY_VISITS) {
      expect(dayAnswer(visit.exchanges[0]).slovak).not.toBe("Dobrú noc.");
    }
    const maria = DAY_VISITS.find((visit) => visit.who === "maria");
    expect(maria && dayAnswer(maria.exchanges[0]).slovak).toBe("Dobrý večer.");
  });

  it("keeps ty for friends and vy for everyone else", () => {
    const answers = Object.fromEntries(
      DAY_VISITS.map((visit) => [
        visit.who,
        visit.exchanges.map((exchange) => dayAnswer(exchange).slovak),
      ]),
    );
    expect(answers.marek).toEqual(["Ahoj.", "Dobre, ďakujem. A ty?", "Maj sa."]);
    expect(answers.lucia).toEqual(["Dobrý deň.", "Dobre, ďakujem. A vy?", "Dovidenia."]);
  });

  it("ends each visit on a goodbye, so the visitor walks off", () => {
    for (const visit of DAY_VISITS) {
      expect(visit.exchanges.at(-1)?.reply.slovak).toMatch(/Maj sa|Dovidenia|Dobrú noc/);
    }
  });

  it("voices each line that fits in Alex's voice once, and every answer in its speaker's", () => {
    const turns = dayTurns();
    expect(new Set(turns.map((turn) => turn.id)).size).toBe(turns.length);
    expect(turns.filter((turn) => turn.speaker !== "You")).toHaveLength(12);
    expect(turns.find((turn) => turn.id === "day/maria-bye")?.speaker).toBe("Mária");
    expect(turns.find((turn) => turn.id === "day/say/dobru-noc")?.slovak).toBe(
      "Dobrú noc.",
    );
    expect(turns.some((turn) => turn.slovak === "Som doma. A ty?")).toBe(false);
  });
});
