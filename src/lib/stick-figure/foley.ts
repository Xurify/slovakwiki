import { getStoredSfxPreference } from "$lib/audio/sfx";
import { getAudioVolume } from "$lib/audio/volume";
import type { FoleyId } from "./act-motions";
import { cues } from "./ambience";

/**
 * The small sounds of what the cast does, synthesized like the footsteps so
 * there is nothing to load: a spoon on a pot, a lid set down, a sip of hot
 * soup. They play with background sound off, but not with sound off.
 */
export function playFoley(id: FoleyId): void {
  if (getStoredSfxPreference() === "off") return;
  const kit = cues();
  if (!kit) return;

  const { ctx, noise } = kit;
  const out = ctx.createGain();
  out.gain.value = 0.35 * getAudioVolume();
  out.connect(ctx.destination);
  const now = ctx.currentTime;

  /** A struck bit of metal: a few inharmonic partials dying away. */
  const ring = (partials: number[], level: number, decay: number, at = 0) => {
    for (const [index, hz] of partials.entries()) {
      const tone = ctx.createOscillator();
      const gain = ctx.createGain();
      tone.frequency.value = hz;
      const peak = level / (index + 1);
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(peak, now + at + 0.003);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + at + decay / (1 + index * 0.4),
      );
      tone.connect(gain).connect(out);
      tone.start(now + at);
      tone.stop(now + at + decay + 0.05);
    }
  };

  /** Filtered noise with a shaped loudness: breath, a sip, a hiss. */
  const air = (
    type: BiquadFilterType,
    from: number,
    to: number,
    level: number,
    length: number,
    attack = 0.05,
  ) => {
    const source = ctx.createBufferSource();
    source.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = type === "bandpass" ? 3 : 0.7;
    filter.frequency.setValueAtTime(from, now);
    filter.frequency.exponentialRampToValueAtTime(to, now + length);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(level, now + attack);
    gain.gain.setValueAtTime(level, now + length * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    source.connect(filter).connect(gain).connect(out);
    source.start(now, Math.random(), length + 0.05);
  };

  switch (id) {
    case "clink":
      ring([2650, 4100], 0.16, 0.18);
      break;
    case "lid":
      ring([480, 1130, 1960, 2870], 0.22, 0.7);
      ring([500, 1180], 0.08, 0.3, 0.09);
      break;
    case "slurp":
      air("bandpass", 700, 2600, 0.5, 0.42, 0.04);
      break;
    case "blow":
      air("lowpass", 1400, 700, 0.35, 0.7, 0.08);
      break;
    case "steam":
      air("highpass", 2500, 4200, 0.25, 1.1, 0.15);
      break;
    case "hop": {
      const thud = ctx.createOscillator();
      const gain = ctx.createGain();
      thud.frequency.setValueAtTime(140, now);
      thud.frequency.exponentialRampToValueAtTime(60, now + 0.1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.5, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      thud.connect(gain).connect(out);
      thud.start(now);
      thud.stop(now + 0.15);
      break;
    }
  }

  window.setTimeout(() => out.disconnect(), 1500);
}
