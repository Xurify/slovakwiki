import { describe, expect, it } from "vitest";

import { ambienceFor } from "./ambience";

describe("the sound of a place", () => {
  it("has birds outside by day and crickets after dark", () => {
    expect(ambienceFor("default", { time: "day", weather: "clear" }).layers).toEqual([
      "birds",
      "wind",
    ]);
    expect(ambienceFor("default", { time: "night", weather: "clear" }).layers).toEqual([
      "wind",
      "crickets",
    ]);
  });

  it("runs the tram until night", () => {
    expect(ambienceFor("plaza", { time: "evening", weather: "clear" }).layers).toContain(
      "tram",
    );
    expect(
      ambienceFor("plaza", { time: "night", weather: "clear" }).layers,
    ).not.toContain("tram");
  });

  it("hears rain through the window indoors, and snow only outside", () => {
    expect(ambienceFor("cafe", { time: "day", weather: "rain" })).toEqual({
      indoors: true,
      layers: ["murmur", "clinks", "rain"],
    });
    expect(ambienceFor("home", { time: "day", weather: "snow" }).layers).toEqual(["hum"]);
    expect(ambienceFor("market", { time: "day", weather: "snow" })).toEqual({
      indoors: false,
      layers: ["murmur", "wind"],
    });
  });
});
