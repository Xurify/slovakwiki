import { describe, expect, it } from "vitest";

import { DAY_ROUNDS, GREETINGS, dayTurns, dayWhy, isDayRight, pairOf } from "./scene-day";
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
  it("meets each person and sees them off, with every answer among the choices", () => {
    expect(new Set(DAY_ROUNDS.map((round) => round.id)).size).toBe(DAY_ROUNDS.length);
    for (let at = 0; at < DAY_ROUNDS.length; at += 2) {
      const [meet, leave] = DAY_ROUNDS.slice(at, at + 2);
      expect(meet.leaving).toBe(false);
      expect(leave.leaving).toBe(true);
      expect(leave.who).toBe(meet.who);
      expect(pairOf(DAY_ROUNDS, at)).toEqual([meet, leave]);
      expect(pairOf(DAY_ROUNDS, at + 1)).toEqual([meet, leave]);
    }
    for (const round of DAY_ROUNDS) {
      for (const answer of round.answers) expect(GREETINGS).toContain(answer);
    }
  });

  it("never takes Dobrú noc as a hello", () => {
    const meeting = DAY_ROUNDS.filter((round) => !round.leaving);
    expect(meeting.some((round) => isDayRight(round, "Dobrú noc."))).toBe(false);

    const night = DAY_ROUNDS.find((round) => round.id === "maria-meets");
    expect(night && isDayRight(night, "Dobrý večer.")).toBe(true);
    expect(night && dayWhy(night, "Dobrú noc.")).toBe(
      "**Dobrú noc** is a goodbye when you part for the night, never a hello. Greeting Mária late at night: **Dobrý večer**.",
    );
  });

  it("keeps Ahoj for friends and Dobrý deň for everyone else", () => {
    const marek = DAY_ROUNDS.find((round) => round.id === "marek-meets");
    expect(marek && isDayRight(marek, "Dobrý deň.")).toBe(false);
    expect(marek && dayWhy(marek, "Dobrý deň.")).toBe(
      "**Dobrý deň** is a hello in the daytime, to people you say vy to. Greeting Marek, a friend, in the morning: **Ahoj**.",
    );

    const lucia = DAY_ROUNDS.find((round) => round.id === "lucia-meets");
    expect(lucia && isDayRight(lucia, "Ahoj.")).toBe(false);
    expect(lucia && dayWhy(lucia, "Ahoj.")).toBe(
      "**Ahoj** is a hello or a goodbye between friends. Greeting Lucia in the afternoon: **Dobrý deň**.",
    );

    const bye = DAY_ROUNDS.find((round) => round.id === "marek-leaves");
    expect(bye && isDayRight(bye, "Dovidenia.")).toBe(false);
    expect(bye && isDayRight(bye, "Maj sa.")).toBe(true);
  });

  it("voices every greeting in Alex's voice and every answer in its speaker's", () => {
    const turns = dayTurns();
    expect(new Set(turns.map((turn) => turn.id)).size).toBe(turns.length);
    expect(turns.length).toBe(GREETINGS.length + DAY_ROUNDS.length);
    expect(turns.slice(0, GREETINGS.length).every((turn) => turn.speaker === "You")).toBe(
      true,
    );
    expect(turns.find((turn) => turn.id === "day/maria-leaves")?.speaker).toBe("Mária");
    expect(turns.find((turn) => turn.id === "day/say/dobru-noc")?.slovak).toBe(
      "Dobrú noc.",
    );
  });
});
