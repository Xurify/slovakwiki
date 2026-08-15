export type QuarterMinute = 0 | 15 | 30 | 45;

export interface ClockFaceTime {
  /** 0–23 hour of day */
  hour: number;
  minute: QuarterMinute;
}

/** Any minute on the clock (0–23h, 0–59m). */
export interface ClockTimeOfDay {
  hour: number;
  minute: number;
}

export type DayPart =
  | "ráno"
  | "dopoludnia"
  | "doobeda"
  | "napoludnie"
  | "naobed"
  | "popoludní"
  | "poobede"
  | "večer"
  | "v noci";

/** Colloquial day-part tags paired with formal forms in teaching (ucimesaslovencinu.sk). */
export const DAY_PART_ALIASES: Record<DayPart, DayPart> = {
  ráno: "ráno",
  dopoludnia: "dopoludnia",
  doobeda: "dopoludnia",
  napoludnie: "napoludnie",
  naobed: "napoludnie",
  popoludní: "popoludní",
  poobede: "popoludní",
  večer: "večer",
  "v noci": "v noci",
};

export const EXACT_MINUTE_POOL = [5, 10, 20, 26] as const;

export const QUARTERS: QuarterMinute[] = [0, 15, 30, 45];
