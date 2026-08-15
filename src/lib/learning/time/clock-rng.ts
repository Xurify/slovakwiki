import type {
  ClockFaceTime,
  ClockTimeOfDay,
  DayPart,
  QuarterMinute,
} from "./clock-types";
import { EXACT_MINUTE_POOL, QUARTERS } from "./clock-types";
import { dayPartForHour24 } from "./clock-phrases";

export function randomFaceHour12(rng: () => number = Math.random): number {
  return 1 + Math.floor(rng() * 12);
}

export function randomQuarterMinute(rng: () => number = Math.random): QuarterMinute {
  return QUARTERS[Math.floor(rng() * QUARTERS.length)] ?? 0;
}

export function shuffleArray<T>(
  items: readonly T[],
  rng: () => number = Math.random,
): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const current = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = current;
  }
  return pool;
}

export function randomDrillTime(random: () => number = Math.random): ClockFaceTime {
  const useFormal = random() < 0.2;
  const hour = useFormal ? 13 + Math.floor(random() * 11) : 1 + Math.floor(random() * 12);
  const minute = QUARTERS[Math.floor(random() * QUARTERS.length)] ?? 0;
  return { hour, minute };
}

export function random24hQuarterTime(rng: () => number = Math.random): ClockFaceTime {
  const hour = 13 + Math.floor(rng() * 11);
  const minute = QUARTERS[Math.floor(rng() * QUARTERS.length)] ?? 0;
  return { hour, minute };
}

export function randomExactMinuteTime(rng: () => number = Math.random): ClockTimeOfDay {
  const hour = 1 + Math.floor(rng() * 12);
  const index = Math.floor(rng() * EXACT_MINUTE_POOL.length);
  const minute = EXACT_MINUTE_POOL[index] ?? 10;
  return { hour, minute };
}

export function randomNoonOrMidnight(rng: () => number = Math.random): ClockFaceTime {
  return rng() < 0.5 ? { hour: 12, minute: 0 } : { hour: 0, minute: 0 };
}

/** Morning vs evening pair for day-part drills (same face, different tag). */
export function dayPartDisambiguationPair(): {
  morning: ClockFaceTime;
  evening: ClockFaceTime;
  dayPartMorning: DayPart;
  dayPartEvening: DayPart;
} {
  return {
    morning: { hour: 6, minute: 15 },
    evening: { hour: 18, minute: 15 },
    dayPartMorning: dayPartForHour24(6),
    dayPartEvening: dayPartForHour24(18),
  };
}
