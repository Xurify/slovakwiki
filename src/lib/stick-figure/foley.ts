import { getStoredSfxPreference } from "$lib/audio/sfx";
import type { FoleyId } from "./act-motions";
import { cueOut, cues } from "./ambience";

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
  // Through the stage's cue output, so a pause or a skip cuts a sniff or a rattle off mid-sound.
  const out = cueOut(ctx, 0.35, 2600);
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

  /** Filtered noise with a shaped loudness: breath, a sip, a hiss, running water. */
  const air = (
    type: BiquadFilterType,
    from: number,
    to: number,
    level: number,
    length: number,
    attack = 0.05,
    at = 0,
  ) => {
    const start = now + at;
    const source = ctx.createBufferSource();
    source.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = type === "bandpass" ? 3 : 0.7;
    filter.frequency.setValueAtTime(from, start);
    filter.frequency.exponentialRampToValueAtTime(to, start + length);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + attack);
    gain.gain.setValueAtTime(level, start + length * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    source.connect(filter).connect(gain).connect(out);
    // The noise buffer is two seconds long: start early enough in it to last.
    source.start(start, Math.random() * Math.max(0, 1.9 - length), length + 0.05);
  };

  /** A blow on something solid: a knuckle on a door, a knife on a board, a pot set down. */
  const thump = (from: number, to: number, level: number, length: number, at = 0) => {
    const start = now + at;
    const tone = ctx.createOscillator();
    const gain = ctx.createGain();
    tone.frequency.setValueAtTime(from, start);
    tone.frequency.exponentialRampToValueAtTime(to, start + length * 0.8);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    tone.connect(gain).connect(out);
    tone.start(start);
    tone.stop(start + length + 0.02);
  };

  /** A hinge's creak: a slow buzz of stick and slip through a narrow resonance. */
  const creak = (at: number, length: number, level: number) => {
    const start = now + at;
    const tone = ctx.createOscillator();
    tone.type = "sawtooth";
    tone.frequency.setValueAtTime(48, start);
    tone.frequency.linearRampToValueAtTime(70, start + length);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 8;
    filter.frequency.setValueAtTime(1400, start);
    filter.frequency.linearRampToValueAtTime(1100, start + length);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + length * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    tone.connect(filter).connect(gain).connect(out);
    tone.start(start);
    tone.stop(start + length + 0.02);
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
    case "hop":
      thump(140, 60, 0.5, 0.13);
      break;
    case "knock":
      for (const at of [0, 0.19, 0.38]) {
        thump(190, 95, 0.55, 0.1, at);
        air("bandpass", 1600, 1200, 0.12, 0.04, 0.003, at);
      }
      break;
    case "door-open":
      // The handle pressed and the latch drawing back, then the door swinging in on its hinges.
      ring([2300, 3500], 0.04, 0.035);
      ring([1800, 2900], 0.03, 0.03, 0.07);
      air("bandpass", 380, 240, 0.06, 1, 0.3, 0.1);
      creak(0.3, 0.45, 0.08);
      break;
    case "door-shut":
      // Wood meeting its frame, then the latch dropping into place.
      thump(105, 60, 0.26, 0.16);
      air("bandpass", 700, 350, 0.06, 0.08, 0.004);
      ring([2100, 3300], 0.04, 0.04, 0.05);
      break;
    case "tap":
      air("bandpass", 2600, 2300, 0.16, 1.9, 0.08);
      break;
    case "fill":
      // A vessel filling sounds higher as it fills.
      air("bandpass", 650, 1500, 0.2, 1.7, 0.1);
      break;
    case "pour":
      air("bandpass", 1300, 1700, 0.16, 1.4, 0.08);
      break;
    case "chop":
      thump(420, 160, 0.35, 0.05);
      air("highpass", 3500, 3000, 0.08, 0.03, 0.002);
      break;
    case "peel":
      air("highpass", 3000, 5200, 0.1, 0.16, 0.02);
      break;
    case "salt":
      for (const at of [0, 0.06, 0.12]) air("highpass", 6000, 6500, 0.1, 0.04, 0.003, at);
      break;
    case "splash":
      air("bandpass", 900, 450, 0.28, 0.32, 0.01);
      break;
    case "plop":
      for (const at of [0, 0.09, 0.17]) {
        thump(700, 220, 0.18, 0.08, at);
        air("bandpass", 800, 500, 0.1, 0.12, 0.01, at);
      }
      break;
    case "gas":
      ring([3200], 0.08, 0.03);
      air("lowpass", 700, 1300, 0.22, 0.5, 0.04, 0.05);
      break;
    case "keys":
      for (const at of [0, 0.07, 0.13]) ring([3300, 4700, 6100], 0.06, 0.25, at);
      break;
    case "chair":
      air("bandpass", 320, 210, 0.16, 0.35, 0.05);
      thump(120, 70, 0.25, 0.1, 0.3);
      break;
    case "thud":
      thump(110, 60, 0.4, 0.14);
      break;
    case "sniff":
      air("highpass", 1800, 2600, 0.22, 0.28, 0.12);
      air("highpass", 1800, 2600, 0.22, 0.32, 0.12, 0.38);
      break;
    case "rattle":
      for (const at of [0, 0.12, 0.27, 0.4]) ring([480, 1130], 0.06, 0.12, at);
      break;
    case "ring":
      // A phone's trill: two notes a third apart, alternating fast.
      for (const [index, at] of [0, 0.06, 0.12, 0.18, 0.24, 0.3, 0.36, 0.42].entries())
        ring([index % 2 ? 1760 : 1397], 0.05, 0.07, at);
      break;
    case "compute":
      // A robot computing: gentle rising electronic chime.
      for (const [index, at] of [0, 0.08, 0.16].entries())
        ring([index === 0 ? 1046 : index === 1 ? 1318 : 1568], 0.04, 0.08, at);
      break;
  }
}
