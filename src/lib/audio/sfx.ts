import { getAudioVolume } from "./volume";

export type SfxPreference = "on" | "off";

export type AnswerSfxKind = "correct" | "almost" | "incorrect";

export const SFX_STORAGE_KEY = "slovak.wiki.sfx-preference";
export const SFX_CHANGE_EVENT = "slovak-sfx-change";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

let audioCtx: AudioContext | null = null;

export function isSfxPreference(
  value: string | null | undefined,
): value is SfxPreference {
  return value === "on" || value === "off";
}

export function getStoredSfxPreference(storage?: StorageLike): SfxPreference {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);

  if (!store) return "on";

  try {
    const stored = store.getItem(SFX_STORAGE_KEY);
    return isSfxPreference(stored) ? stored : "on";
  } catch {
    return "on";
  }
}

export function getInitialSfxPreference(): SfxPreference {
  return getStoredSfxPreference();
}

export function setSfxPreference(preference: SfxPreference, storage?: StorageLike): void {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);

  if (!store) return;

  try {
    store.setItem(SFX_STORAGE_KEY, preference);
  } catch {
    // Ignore quota / private-mode failures.
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SFX_CHANGE_EVENT));
  }
}

export function toggleSfxPreference(preference: SfxPreference): SfxPreference {
  return preference === "on" ? "off" : "on";
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!Ctx) return null;

  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new Ctx();
  }

  return audioCtx;
}

async function ensureRunning(ctx: AudioContext): Promise<boolean> {
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
    return ctx.state === "running";
  } catch {
    return false;
  }
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    start,
    duration,
    gain = 0.1,
    type = "sine",
  }: {
    frequency: number;
    start: number;
    duration: number;
    gain?: number;
    type?: OscillatorType;
  },
): void {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);

  const scaled = Math.max(0.0001, gain * getAudioVolume());

  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(scaled, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(amp);
  amp.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function sfxEnabled(): boolean {
  return getStoredSfxPreference() === "on";
}

async function withContext(
  play: (ctx: AudioContext, now: number) => void,
): Promise<void> {
  if (!sfxEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (!(await ensureRunning(ctx))) return;

  play(ctx, ctx.currentTime);
}

/** Soft ascending major third — correct answer. */
export function playCorrectSfx(): void {
  void withContext((ctx, now) => {
    tone(ctx, { frequency: 523.25, start: now, duration: 0.09, gain: 0.09 });
    tone(ctx, {
      frequency: 659.25,
      start: now + 0.07,
      duration: 0.12,
      gain: 0.1,
    });
  });
}

/** Soft mid “almost” — accent near-miss. */
export function playAlmostSfx(): void {
  void withContext((ctx, now) => {
    tone(ctx, { frequency: 466.16, start: now, duration: 0.1, gain: 0.08 });
    tone(ctx, {
      frequency: 554.37,
      start: now + 0.08,
      duration: 0.1,
      gain: 0.07,
    });
  });
}

/** Soft descending — incorrect / reveal. */
export function playIncorrectSfx(): void {
  void withContext((ctx, now) => {
    tone(ctx, { frequency: 392, start: now, duration: 0.1, gain: 0.08 });
    tone(ctx, {
      frequency: 311.13,
      start: now + 0.08,
      duration: 0.14,
      gain: 0.07,
    });
  });
}

/** Longer rising arpeggio — practice set finished. */
export function playFinishSfx(): void {
  void withContext((ctx, now) => {
    tone(ctx, { frequency: 523.25, start: now, duration: 0.1, gain: 0.08 });
    tone(ctx, {
      frequency: 659.25,
      start: now + 0.09,
      duration: 0.1,
      gain: 0.09,
    });
    tone(ctx, {
      frequency: 783.99,
      start: now + 0.18,
      duration: 0.16,
      gain: 0.1,
    });
  });
}

export function playAnswerSfx(kind: AnswerSfxKind): void {
  if (kind === "correct") {
    playCorrectSfx();
    return;
  }

  if (kind === "almost") {
    playAlmostSfx();
    return;
  }

  playIncorrectSfx();
}
