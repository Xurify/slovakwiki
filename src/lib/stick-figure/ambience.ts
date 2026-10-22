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
    if (layer === "birds") return !dark && mood.weather === "clear";
    if (layer === "tram") return mood.time !== "night";
    return true;
  });

  if (outdoors && dark && mood.weather === "clear") layers.push("crickets");
  if (mood.weather === "rain") layers.push("rain");
  if (mood.weather === "snow" && outdoors) layers.push("wind");
  return { indoors: !outdoors, layers: [...new Set(layers)] };
}

export interface AmbiencePlayer {
  stop(): void;
}

/** Under the site volume: a background the voices talk over, steady rather than dipping as they speak. */
const LEVEL = 0.14;

interface Kit {
  ctx: AudioContext;
  indoors: boolean;
  noise: AudioBuffer;
  out: AudioNode;
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
  { ctx, noise, out }: Kit,
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
    bed(
      kit,
      [
        { frequency: 900, type: "highpass" },
        { frequency: kit.indoors ? 1800 : 7000, type: "lowpass" },
      ],
      kit.indoors ? 0.12 : 0.3,
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
export function playAmbience({ indoors, layers }: Ambience): AmbiencePlayer | undefined {
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

  const timers = new Set<number>();
  const kit: Kit = {
    ctx,
    indoors,
    noise: noiseBuffer(ctx),
    out: master,
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
  };
  for (const layer of layers) LAYERS[layer](kit);

  return {
    stop() {
      for (const timer of timers) window.clearTimeout(timer);
      timers.clear();
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      window.setTimeout(() => void ctx.close(), 500);
    },
  };
}
