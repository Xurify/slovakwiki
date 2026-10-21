import { describe, expect, it } from "vitest";

import { GREETINGS, GREET_ROUNDS, greetWhy, isGreetRight } from "./scene-greet";
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

describe("greetings by the time of day", () => {
  it("has one round for each moment, every answer among the choices", () => {
    expect(new Set(GREET_ROUNDS.map((round) => round.id)).size).toBe(GREET_ROUNDS.length);
    for (const round of GREET_ROUNDS) {
      for (const answer of round.answers) expect(GREETINGS).toContain(answer);
    }
  });

  it("never takes Dobrú noc as a hello", () => {
    const meeting = GREET_ROUNDS.filter((round) => !round.leaving);
    expect(meeting.some((round) => isGreetRight(round, "Dobrú noc."))).toBe(false);

    const night = GREET_ROUNDS.find((round) => round.id === "meet-night");
    expect(night && isGreetRight(night, "Dobrý večer.")).toBe(true);
    expect(night && greetWhy(night, "Dobrú noc.")).toBe(
      "**Dobrú noc** is a goodbye late at night, never a hello. Meeting someone late at night: **Dobrý večer**.",
    );
  });
});
