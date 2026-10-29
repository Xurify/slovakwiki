import { playClockTimeout } from "$lib/audio/play-clock";
import { SFX_CHANGE_EVENT, getStoredSfxPreference } from "$lib/audio/sfx";
import { AUDIO_VOLUME_CHANGE_EVENT, getAudioVolume } from "$lib/audio/volume";
import type { Shoes } from "./looks";
import { PLACES, type Ground } from "./places";
import { isDark, isFalling, type SceneMood } from "./scene-mood";
import type { StageSetting } from "./stage-setting";

export type AmbienceLayer =
  "birds" | "clinks" | "crickets" | "hum" | "murmur" | "rain" | "tram" | "wind";

export interface Ambience {
  layers: AmbienceLayer[];
  /** Weather heard through a window, muffled. */
  indoors: boolean;
  /** Evening or night: fewer voices on the square, and the wind drops with the day. */
  dark: boolean;
}

export function ambienceFor(setting: StageSetting, mood: SceneMood): Ambience {
  const { glass, outdoors, sounds } = PLACES[setting];
  const dark = isDark(mood.time);
  const layers = sounds.filter((layer) => {
    if (layer === "birds") return !dark && !isFalling(mood.weather);
    if (layer === "tram") return mood.time !== "night";
    return true;
  });

  if (outdoors && dark && !isFalling(mood.weather)) layers.push("crickets");
  // Rain is heard where it is seen: outside, or through a window.
  if (mood.weather === "rain" && (outdoors || glass)) layers.push("rain");
  if (mood.weather === "snow" && outdoors) layers.push("wind");
  return { dark, indoors: !outdoors, layers: [...new Set(layers)] };
}

export interface AmbiencePlayer {
  /** Fade over to another place or weather; what both share keeps playing. */
  set(ambience: Ambience): void;
  stop(): void;
}

/** Under the site volume: a background the voices talk over, steady rather than dipping as they speak. */
const LEVEL = 0.14;
/** Seconds for a layer to come in or die away, so a change of weather is heard as weather, not a cut. */
const FADE_S = 1.5;

interface Kit {
  ctx: AudioContext;
  dark: boolean;
  indoors: boolean;
  noise: AudioBuffer;
  out: AudioNode;
  /** Keep a source until it ends, so a layer that stops can stop it. */
  hold?: (source: AudioScheduledSourceNode) => void;
  /** Run `play` again and again, `min`–`max` seconds apart, the first time within `first` s. */
  every: (min: number, max: number, play: () => void, first?: number) => void;
}

function between(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1)
    data[index] = Math.random() * 2 - 1;
  return buffer;
}

function bed(
  { ctx, hold, noise, out }: Kit,
  filters: Array<{ frequency: number; q?: number; type: BiquadFilterType }>,
  level: number,
): { gain: GainNode; source: AudioBufferSourceNode } {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  source.loopStart = Math.random();

  let node: AudioNode = source;
  for (const { frequency, q = 0.7, type } of filters) {
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    node.connect(filter);
    node = filter;
  }

  const gain = ctx.createGain();
  gain.gain.value = level;
  node.connect(gain).connect(out);
  source.start();
  hold?.(source);
  return { gain, source };
}

function strike(
  { ctx, out }: Kit,
  frequency: number,
  level: number,
  decay: number,
  at = 0,
) {
  const start = ctx.currentTime + at;
  for (const [ratio, share] of [
    [1, 1],
    [2.76, 0.25],
  ]) {
    const tone = ctx.createOscillator();
    const gain = ctx.createGain();
    tone.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(level * share, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + decay / ratio);
    tone.connect(gain).connect(out);
    tone.start(start);
    tone.stop(start + decay);
  }
}

/**
 * Three seconds of drops landing, written once and looped: ticks of noise,
 * some duller than others. A node per drop would be dozens a second.
 */
function patterBuffer(ctx: AudioContext, indoors: boolean): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const drops = indoors ? 36 : 75;
  for (let drop = 0; drop < drops; drop += 1) {
    const start = Math.floor(Math.random() * data.length);
    const length = Math.floor(ctx.sampleRate * between(0.015, 0.04));
    const level = between(0.08, 0.25);
    const dull = between(0.2, 0.8);
    let last = 0;
    for (let at = 0; at < length; at += 1) {
      last = last * dull + (Math.random() * 2 - 1) * (1 - dull);
      // Wrapped round the end, so the loop has no seam.
      data[(start + at) % data.length] += last * level * Math.exp((-4 * at) / length);
    }
  }
  return buffer;
}

function chirp({ ctx, out }: Kit, notes: number) {
  const pitch = between(2800, 4200);
  for (let note = 0; note < notes; note += 1) {
    const start = ctx.currentTime + note * between(0.08, 0.13);
    const tone = ctx.createOscillator();
    const gain = ctx.createGain();
    tone.frequency.setValueAtTime(pitch, start);
    tone.frequency.exponentialRampToValueAtTime(pitch * between(1.15, 1.4), start + 0.06);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.035, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
    tone.connect(gain).connect(out);
    tone.start(start);
    tone.stop(start + 0.1);
  }
}

const LAYERS: Record<AmbienceLayer, (kit: Kit) => void> = {
  birds(kit) {
    kit.every(2.5, 7, () => chirp(kit, Math.round(between(2, 5))));
  },

  clinks(kit) {
    kit.every(2.5, 7, () => {
      strike(kit, between(2600, 3600), 0.03, 0.3);
      if (Math.random() < 0.4) strike(kit, between(2600, 3600), 0.02, 0.25, 0.12);
    });
  },

  crickets(kit) {
    kit.every(0.9, 1.4, () => {
      for (let pulse = 0; pulse < 3; pulse += 1)
        strike(kit, 4600, 0.008, 0.03, pulse * 0.035);
    });
  },

  hum(kit) {
    bed(kit, [{ frequency: 180, type: "lowpass" }], 0.12);
  },

  murmur(kit) {
    // Voices too far off to make out: talk-band noise that swells and dips. Few are about after dark.
    const crowd = kit.dark ? 0.35 : 1;
    const { gain } = bed(
      kit,
      [
        { frequency: 650, q: 0.8, type: "bandpass" },
        { frequency: 1800, type: "lowpass" },
      ],
      0.3 * crowd,
    );
    kit.every(0.25, 0.6, () => {
      gain.gain.linearRampToValueAtTime(
        between(0.15, 0.45) * crowd,
        kit.ctx.currentTime + 0.25,
      );
    });
  },

  rain(kit) {
    // A soft wash with drops landing on it: flat noise alone sounds like static.
    bed(
      kit,
      [
        { frequency: 500, type: "highpass" },
        { frequency: kit.indoors ? 1400 : 4500, type: "lowpass" },
      ],
      kit.indoors ? 0.05 : 0.11,
    );
    const patter = kit.ctx.createBufferSource();
    patter.buffer = patterBuffer(kit.ctx, kit.indoors);
    patter.loop = true;
    const filter = kit.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = kit.indoors ? 1100 : 3000;
    filter.Q.value = 0.7;
    const gain = kit.ctx.createGain();
    gain.gain.value = kit.indoors ? 0.3 : 0.6;
    patter.connect(filter).connect(gain).connect(kit.out);
    patter.start();
    kit.hold?.(patter);
  },

  tram(kit) {
    // The first tram comes soon after the sound is turned on, so it is heard at all.
    kit.every(
      18,
      35,
      () => {
        strike(kit, 1318.5, 0.035, 1.2);
        strike(kit, 1046.5, 0.035, 1.2, 0.35);
        const rumble = bed(kit, [{ frequency: 120, type: "lowpass" }], 0);
        const now = kit.ctx.currentTime;
        rumble.gain.gain.linearRampToValueAtTime(0.3, now + 1.5);
        rumble.gain.gain.linearRampToValueAtTime(0, now + 4);
        rumble.source.stop(now + 4.1);
      },
      6,
    );
  },

  wind(kit) {
    // The wind drops with the day: a night breeze, not the afternoon's gusts.
    const breeze = kit.dark ? 0.5 : 1;
    const { gain } = bed(
      kit,
      [
        { frequency: kit.indoors ? 200 : 320, q: 0.5, type: "bandpass" },
        { frequency: 900, type: "lowpass" },
      ],
      0.15 * breeze,
    );
    kit.every(2, 4, () => {
      gain.gain.linearRampToValueAtTime(
        between(0.05, 0.3) * breeze,
        kit.ctx.currentTime + 2,
      );
    });
  },
};

/** Start a place's sound, fading in; undefined where the browser has no Web Audio. */
export function playAmbience(first: Ambience): AmbiencePlayer | undefined {
  const Context =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Context) return undefined;

  const ctx = trackContext(new Context());
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.setTargetAtTime(level(), ctx.currentTime, 0.3);
  master.connect(ctx.destination);
  const noise = noiseBuffer(ctx);

  function level(): number {
    return getStoredSfxPreference() === "off" ? 0 : LEVEL * getAudioVolume();
  }

  // Retune while it plays, so muting mid-segment quietens the place too.
  function retune(): void {
    master.gain.setTargetAtTime(level(), ctx.currentTime, 0.3);
  }

  window.addEventListener(SFX_CHANGE_EVENT, retune);
  window.addEventListener(AUDIO_VOLUME_CHANGE_EVENT, retune);

  /** Each layer by name and whether it is heard through a window. */
  const running = new Map<string, () => void>();

  function start(layer: AmbienceLayer, indoors: boolean, dark: boolean): () => void {
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.setTargetAtTime(1, ctx.currentTime, FADE_S / 3);
    out.connect(master);

    // Cancels of the layer's repeats, which wait on play time like the rest of the stage.
    const timers = new Set<() => void>();
    const sources = new Set<AudioScheduledSourceNode>();
    LAYERS[layer]({
      ctx,
      dark,
      hold: (source) => {
        sources.add(source);
        source.addEventListener("ended", () => sources.delete(source));
      },
      indoors,
      noise,
      out,
      every(min, max, play, first = max) {
        const next = (wait: number) => {
          const cancel = playClockTimeout(() => {
            timers.delete(cancel);
            play();
            next(between(min, max));
          }, wait * 1000);
          timers.add(cancel);
        };
        next(between(0, first));
      },
    });

    return () => {
      for (const cancel of timers) cancel();
      timers.clear();
      out.gain.setTargetAtTime(0, ctx.currentTime, FADE_S / 3);
      playClockTimeout(() => {
        for (const source of sources) {
          try {
            source.stop();
          } catch {
            // A tram's rumble has its stop scheduled already, and some browsers refuse a second.
          }
        }
        out.disconnect();
      }, FADE_S * 2000);
    };
  }

  function set({ dark, indoors, layers }: Ambience): void {
    const wanted = new Map(layers.map((layer) => [`${layer}:${indoors}:${dark}`, layer]));
    for (const [key, stop] of running) {
      if (wanted.has(key)) continue;
      stop();
      running.delete(key);
    }
    for (const [key, layer] of wanted) {
      if (!running.has(key)) running.set(key, start(layer, indoors, dark));
    }
  }

  set(first);

  return {
    set,
    stop() {
      window.removeEventListener(SFX_CHANGE_EVENT, retune);
      window.removeEventListener(AUDIO_VOLUME_CHANGE_EVENT, retune);

      for (const stop of running.values()) stop();
      running.clear();
      if (soundHeld) {
        // Held, nothing sounds until the thaw: silence it now, not as a fade that starts on the thaw.
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(0, ctx.currentTime);
      } else {
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      }
      playClockTimeout(() => {
        contexts.delete(ctx);
        void ctx.close();
      }, 500);
    },
  };
}

/**
 * What you hear on a Bratislava platform as a tram comes in: the driver's
 * bell, the rails starting to hum, the wheels knocking over the rail joints
 * as it gets close, the motor whining down, and the brakes as it stops.
 * About four seconds; plays on its own, background sound or not, and
 * stops with the stage like the other cues.
 */
export function playTramCue(): void {
  if (getStoredSfxPreference() === "off") return;
  const cue = cues();
  if (!cue) return;

  const { ctx } = cue;
  const out = cueOut(ctx, 0.5, 4800);
  const kit: Kit = {
    ctx,
    dark: false,
    every: () => {},
    indoors: false,
    noise: cue.noise,
    out,
  };
  const now = ctx.currentTime;

  strike(kit, 1250, 0.05, 0.9, 0.2);
  strike(kit, 1250, 0.05, 0.9, 0.5);

  const rumble = bed(kit, [{ frequency: 150, type: "lowpass" }], 0);
  rumble.gain.gain.setValueAtTime(0, now);
  rumble.gain.gain.linearRampToValueAtTime(0.55, now + 2.6);
  rumble.gain.gain.linearRampToValueAtTime(0.4, now + 3.2);
  rumble.gain.gain.linearRampToValueAtTime(0, now + 4.2);
  rumble.source.stop(now + 4.3);

  // Two axles of a bogie over each joint, closer together as it slows.
  for (const [at, level] of [
    [1.1, 0.12],
    [1.24, 0.12],
    [1.75, 0.18],
    [1.9, 0.18],
    [2.4, 0.22],
    [2.57, 0.22],
  ]) {
    const knock = bed(kit, [{ frequency: 520, q: 2, type: "bandpass" }], 0);
    knock.gain.gain.setValueAtTime(level, now + at);
    knock.gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.07);
    knock.source.stop(now + at + 0.1);
  }

  const motor = ctx.createOscillator();
  const motorGain = ctx.createGain();
  motor.frequency.setValueAtTime(520, now + 0.8);
  motor.frequency.exponentialRampToValueAtTime(260, now + 3.2);
  motorGain.gain.setValueAtTime(0, now);
  motorGain.gain.linearRampToValueAtTime(0.018, now + 1.6);
  motorGain.gain.linearRampToValueAtTime(0, now + 3.4);
  motor.connect(motorGain).connect(out);
  motor.start(now + 0.8);
  motor.stop(now + 3.5);

  const brake = ctx.createOscillator();
  const brakeGain = ctx.createGain();
  brake.frequency.setValueAtTime(2350, now + 2.9);
  brake.frequency.linearRampToValueAtTime(2150, now + 3.5);
  brakeGain.gain.setValueAtTime(0, now + 2.9);
  brakeGain.gain.linearRampToValueAtTime(0.012, now + 3.05);
  brakeGain.gain.linearRampToValueAtTime(0, now + 3.5);
  brake.connect(brakeGain).connect(out);
  brake.start(now + 2.9);
  brake.stop(now + 3.6);
}

let cueContext: { ctx: AudioContext; noise: AudioBuffer } | undefined;

/** Every context the stage plays through, so a pause can hold them all. */
const contexts = new Set<AudioContext>();
/** A pause holds the stage's sound: a context made meanwhile starts held too. */
let soundHeld = false;

function trackContext(ctx: AudioContext): AudioContext {
  contexts.add(ctx);
  if (soundHeld) void ctx.suspend().catch(() => undefined);
  return ctx;
}

/**
 * Hold the stage's sound where it is, for a pause: the place's sound, and the
 * footsteps, phones and stings already scheduled. `releaseStageSound` lets it on.
 */
export function holdStageSound(): void {
  soundHeld = true;
  for (const ctx of contexts) void ctx.suspend().catch(() => undefined);
}

export function releaseStageSound(): void {
  soundHeld = false;
  // Every context, whatever its state now: a suspend still on its way lands before this resume, so none is left held.
  for (const ctx of contexts) void ctx.resume().catch(() => undefined);
}

/** One context for the short cues that follow the figures, made on first use. */
export function cues(): { ctx: AudioContext; noise: AudioBuffer } | undefined {
  if (cueContext) {
    if (cueContext.ctx.state === "suspended" && !soundHeld) void cueContext.ctx.resume();
    return cueContext;
  }
  const Context =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Context) return undefined;

  const ctx = trackContext(new Context());
  cueContext = { ctx, noise: noiseBuffer(ctx) };
  return cueContext;
}

/**
 * What a footfall sounds like on each ground: the thud of the heel, the
 * scuff of the sole, any click of the surface, and how much of the top end
 * the floor lets through. Indoors a step is soft, felt more than heard.
 */
const GROUND_STEPS: Record<
  Ground,
  {
    click: number;
    heel: number;
    heelHz: number;
    heelDecay: number;
    sole: number;
    soleHz: number;
    soleDecay: number;
    /** Above this the step is rolled off, so nothing in it is sharp. */
    toneHz: number;
  }
> = {
  // Pavement and cobbles: a firm, bright footfall with a click to it.
  stone: {
    click: 0.22,
    heel: 0.4,
    heelHz: 115,
    heelDecay: 0.08,
    sole: 0.3,
    soleHz: 1700,
    soleDecay: 0.07,
    toneHz: 3600,
  },
  // Boards: a low, short knock.
  wood: {
    click: 0.05,
    heel: 0.4,
    heelHz: 125,
    heelDecay: 0.09,
    sole: 0.18,
    soleHz: 700,
    soleDecay: 0.06,
    toneHz: 1800,
  },
  // Carpet swallows the click; a soft thud and a brush.
  carpet: {
    click: 0,
    heel: 0.28,
    heelHz: 85,
    heelDecay: 0.07,
    sole: 0.12,
    soleHz: 480,
    soleDecay: 0.06,
    toneHz: 1200,
  },
  // A path or grass: little heel, a longer crunch.
  soil: {
    click: 0,
    heel: 0.25,
    heelHz: 100,
    heelDecay: 0.08,
    sole: 0.32,
    soleHz: 1100,
    soleDecay: 0.12,
    toneHz: 2800,
  },
  // Slippers on kitchen tiles: hardly a heel, a light pat and a shuffle.
  tile: {
    click: 0.04,
    heel: 0.18,
    heelHz: 110,
    heelDecay: 0.05,
    sole: 0.2,
    soleHz: 1000,
    soleDecay: 0.1,
    toneHz: 2200,
  },
};

/** The cues still sounding (footsteps, a phone, the sting, a tram, foley), so a stage that stops or skips can silence them. */
const sounding = new Set<GainNode>();

/** An output for one cue, silenced by stopCues or let go after `ms`. */
export function cueOut(ctx: AudioContext, level: number, ms: number): GainNode {
  const out = ctx.createGain();
  out.gain.value = level * getAudioVolume();
  out.connect(ctx.destination);
  sounding.add(out);
  // On play time, so a pause does not cut the cue short before its sound has played out.
  playClockTimeout(() => {
    out.disconnect();
    sounding.delete(out);
  }, ms);
  return out;
}

/**
 * Silence every cue still sounding: the stage has stopped, handed on to the
 * next segment, or jumped to another line. Web Audio schedules a whole walk
 * up front, so without this each skip stacks another walk on the last.
 */
export function stopCues(): void {
  for (const out of sounding) out.disconnect();
  sounding.clear();
}

/**
 * Footsteps for a walk of `steps`, one every `stepMs`, on the `ground`
 * underfoot: heels click on it, soft soles land dull, plain shoes are the
 * ground's own sound.
 */
export function playSteps(
  steps: number,
  stepMs: number,
  { ground, shoes }: { ground: Ground; shoes?: Shoes },
): void {
  if (getStoredSfxPreference() === "off") return;
  const kit = cues();
  if (!kit) return;

  const base = GROUND_STEPS[ground];
  const sound =
    shoes === "heels"
      ? { ...base, click: Math.max(base.click * 2.2, 0.3), sole: base.sole * 0.6 }
      : shoes === "soft"
        ? {
            ...base,
            click: 0,
            heel: base.heel * 0.85,
            sole: base.sole * 0.75,
            soleHz: base.soleHz * 0.7,
          }
        : shoes === "servo"
          ? {
              ...base,
              click: 0.12,
              heel: base.heel * 0.4,
              heelHz: 1200,
              heelDecay: 0.02,
              sole: base.sole * 0.35,
              soleHz: base.soleHz * 0.8,
            }
          : base;

  const { ctx, noise } = kit;
  const level = cueOut(ctx, 0.24, steps * stepMs + 500);
  const out = ctx.createBiquadFilter();
  out.type = "lowpass";
  out.frequency.value = sound.toneHz;
  out.Q.value = 0.5;
  out.connect(level);

  for (let step = 0; step < steps; step += 1) {
    // The heel lands at the widest stride, halfway through each step.
    const at = ctx.currentTime + ((step + 0.5) * stepMs) / 1000 + between(-0.01, 0.01);
    const loud = between(0.6, 1);

    const heel = ctx.createOscillator();
    const heelGain = ctx.createGain();
    heel.frequency.setValueAtTime(sound.heelHz * between(0.85, 1.1), at);
    heel.frequency.exponentialRampToValueAtTime(
      sound.heelHz * 0.45,
      at + sound.heelDecay,
    );
    heelGain.gain.setValueAtTime(0.0001, at);
    // A rounded onset: a footfall, not a tap on the microphone.
    heelGain.gain.exponentialRampToValueAtTime(sound.heel * loud, at + 0.012);
    heelGain.gain.exponentialRampToValueAtTime(0.0001, at + sound.heelDecay + 0.01);
    heel.connect(heelGain).connect(out);
    heel.start(at);
    heel.stop(at + sound.heelDecay + 0.02);

    const sole = ctx.createBufferSource();
    sole.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = sound.soleHz * between(0.85, 1.15);
    filter.Q.value = 0.8;
    const soleGain = ctx.createGain();
    soleGain.gain.setValueAtTime(0.0001, at);
    soleGain.gain.exponentialRampToValueAtTime(sound.sole * loud, at + 0.016);
    soleGain.gain.exponentialRampToValueAtTime(0.0001, at + sound.soleDecay);
    sole.connect(filter).connect(soleGain).connect(out);
    sole.start(at, Math.random(), sound.soleDecay + 0.01);

    if (sound.click > 0) {
      // The tap of a hard surface: a few milliseconds of bright noise on the heel.
      const click = ctx.createBufferSource();
      click.buffer = noise;
      const bright = ctx.createBiquadFilter();
      bright.type = "bandpass";
      bright.frequency.value =
        (shoes === "servo" ? 4200 : shoes === "heels" ? 3400 : 2800) * between(0.9, 1.1);
      bright.Q.value = 2;
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.0001, at);
      clickGain.gain.exponentialRampToValueAtTime(sound.click * loud, at + 0.003);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.025);
      click.connect(bright).connect(clickGain).connect(out);
      click.start(at, Math.random(), 0.03);
    }
  }
}

/**
 * The sting between two podcast segments: two soft notes, a fifth apart,
 * like a radio show's break. Unless sound is off.
 */
export function playSegmentCue(): void {
  if (getStoredSfxPreference() === "off") return;
  const kit = cues();
  if (!kit) return;

  const out = cueOut(kit.ctx, 0.35, 2000);
  const strikeKit: Kit = {
    ctx: kit.ctx,
    dark: false,
    every: () => {},
    indoors: false,
    noise: kit.noise,
    out,
  };
  strike(strikeKit, 659, 0.22, 1.1);
  strike(strikeKit, 988, 0.18, 1.4, 0.16);
}

/** How long the phone sounds before the line that answers or reads it, ms. */
export const PHONE_CUE_MS = { call: 2600, dial: 4200, message: 800 } as const;

/**
 * A phone in the room: a call rings twice, a pair of warbling bursts each;
 * a message pings once, two quick notes. Plays with background sound off,
 * like footsteps, but not with sound off.
 */
export function playPhoneCue(kind: "call" | "dial" | "message"): void {
  if (getStoredSfxPreference() === "off") return;
  const kit = cues();
  if (!kit) return;

  const { ctx } = kit;
  const out = cueOut(ctx, 0.3, 4400);
  const now = ctx.currentTime;

  const beep = (frequency: number, at: number, length: number, level: number) => {
    const tone = ctx.createOscillator();
    const gain = ctx.createGain();
    tone.type = "triangle";
    tone.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + at);
    gain.gain.exponentialRampToValueAtTime(level, now + at + 0.012);
    gain.gain.setValueAtTime(level, now + at + length - 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + at + length);
    tone.connect(gain).connect(out);
    tone.start(now + at);
    tone.stop(now + at + length + 0.02);
  };

  if (kind === "message") {
    beep(1320, 0, 0.09, 0.35);
    beep(1760, 0.12, 0.16, 0.3);
  } else if (kind === "dial") {
    // Six keypad tones, then the far end ringing twice: 425 Hz, the European ringback.
    [1336, 1209, 1477, 1336, 1209, 1477].forEach((frequency, key) =>
      beep(frequency, key * 0.16, 0.1, 0.18),
    );
    for (const at of [1.2, 2.7]) beep(425, at, 1, 0.16);
  } else {
    for (const ring of [0, 1.3]) {
      for (let burst = 0; burst < 10; burst += 1) {
        beep(burst % 2 ? 1180 : 1480, ring + burst * 0.05, 0.05, 0.22);
      }
    }
  }
}
