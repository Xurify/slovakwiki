import { getAudioVolume } from "$lib/audio/volume";
import { isOutdoors, type SceneMood } from "./scene-mood";
import type { StageSetting } from "./stage-setting";

export type AmbienceLayer =
  "birds" | "clinks" | "crickets" | "hum" | "murmur" | "rain" | "tram" | "wind";

export interface Ambience {
  layers: AmbienceLayer[];
  /** Weather heard through a window, muffled. */
  indoors: boolean;
}

const PLACE_LAYERS: Record<StageSetting, readonly AmbienceLayer[]> = {
  cafe: ["murmur", "clinks"],
  classroom: ["hum"],
  counter: ["hum", "murmur"],
  default: ["birds", "wind"],
  home: ["hum"],
  market: ["murmur", "birds"],
  plaza: ["murmur", "birds", "tram"],
  registration: ["hum", "murmur"],
  street: ["murmur"],
  studio: ["hum"],
};

export function ambienceFor(setting: StageSetting, mood: SceneMood): Ambience {
  const outdoors = isOutdoors(setting);
  const dark = mood.time === "evening" || mood.time === "night";
  const layers = PLACE_LAYERS[setting].filter((layer) => {
    if (layer === "birds") return !dark && !["rain", "snow"].includes(mood.weather);
    if (layer === "tram") return mood.time !== "night";
    return true;
  });

  if (outdoors && dark && !["rain", "snow"].includes(mood.weather))
    layers.push("crickets");
  if (mood.weather === "rain") layers.push("rain");
  if (mood.weather === "snow" && outdoors) layers.push("wind");
  return { indoors: !outdoors, layers: [...new Set(layers)] };
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
  indoors: boolean;
  noise: AudioBuffer;
  out: AudioNode;
  /** Keep a looping source, so it is stopped with its layer. */
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

/** One drop landing: a tick of noise, brighter outside than through a window. */
function patter({ ctx, indoors, noise, out }: Kit, at: number) {
  const start = ctx.currentTime + at;
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = indoors ? between(700, 1600) : between(1800, 5000);
  filter.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(between(0.08, 0.25) * (indoors ? 0.5 : 1), start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + between(0.015, 0.04));
  source.connect(filter).connect(gain).connect(out);
  source.start(start, Math.random(), 0.05);
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
    // Voices too far off to make out: talk-band noise that swells and dips.
    const { gain } = bed(
      kit,
      [
        { frequency: 650, q: 0.8, type: "bandpass" },
        { frequency: 1800, type: "lowpass" },
      ],
      0.3,
    );
    kit.every(0.25, 0.6, () => {
      gain.gain.linearRampToValueAtTime(between(0.15, 0.45), kit.ctx.currentTime + 0.25);
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
      kit.indoors ? 0.08 : 0.18,
    );
    kit.every(
      0.2,
      0.2,
      () => {
        const drops = Math.round(between(2, kit.indoors ? 3 : 6));
        for (let drop = 0; drop < drops; drop += 1) patter(kit, between(0, 0.2));
      },
      0.2,
    );
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
    const { gain } = bed(
      kit,
      [
        { frequency: kit.indoors ? 200 : 320, q: 0.5, type: "bandpass" },
        { frequency: 900, type: "lowpass" },
      ],
      0.15,
    );
    kit.every(2, 4, () => {
      gain.gain.linearRampToValueAtTime(between(0.05, 0.3), kit.ctx.currentTime + 2);
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

  const ctx = new Context();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.setTargetAtTime(LEVEL * getAudioVolume(), ctx.currentTime, 0.3);
  master.connect(ctx.destination);
  const noise = noiseBuffer(ctx);

  /** Each layer by name and whether it is heard through a window. */
  const running = new Map<string, () => void>();

  function start(layer: AmbienceLayer, indoors: boolean): () => void {
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.setTargetAtTime(1, ctx.currentTime, FADE_S / 3);
    out.connect(master);

    const timers = new Set<number>();
    const sources: AudioScheduledSourceNode[] = [];
    LAYERS[layer]({
      ctx,
      hold: (source) => sources.push(source),
      indoors,
      noise,
      out,
      every(min, max, play, first = max) {
        const next = (wait: number) => {
          const timer = window.setTimeout(() => {
            timers.delete(timer);
            play();
            next(between(min, max));
          }, wait * 1000);
          timers.add(timer);
        };
        next(between(0, first));
      },
    });

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      timers.clear();
      out.gain.setTargetAtTime(0, ctx.currentTime, FADE_S / 3);
      window.setTimeout(() => {
        for (const source of sources) {
          try {
            source.stop();
          } catch {
            // A one-off sound that already ended.
          }
        }
        out.disconnect();
      }, FADE_S * 2000);
    };
  }

  function set({ indoors, layers }: Ambience): void {
    const wanted = new Map(layers.map((layer) => [`${layer}:${indoors}`, layer]));
    for (const [key, stop] of running) {
      if (wanted.has(key)) continue;
      stop();
      running.delete(key);
    }
    for (const [key, layer] of wanted) {
      if (!running.has(key)) running.set(key, start(layer, indoors));
    }
  }

  set(first);

  return {
    set,
    stop() {
      for (const stop of running.values()) stop();
      running.clear();
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      window.setTimeout(() => void ctx.close(), 500);
    },
  };
}

/**
 * What you hear on a Bratislava platform as a tram comes in: the driver's
 * bell, the rails starting to hum, the wheels knocking over the rail joints
 * as it gets close, the motor whining down, and the brakes as it stops.
 * About four seconds; plays on its own, background sound or not.
 */
export function playTramCue(): void {
  const Context =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Context) return;

  const ctx = new Context();
  const out = ctx.createGain();
  out.gain.value = 0.5 * getAudioVolume();
  out.connect(ctx.destination);
  const kit: Kit = { ctx, every: () => {}, indoors: false, noise: noiseBuffer(ctx), out };
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

  window.setTimeout(() => void ctx.close(), 4800);
}
