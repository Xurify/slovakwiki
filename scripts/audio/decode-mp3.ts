import { MPEGDecoder } from "mpg123-decoder";

export interface Pcm {
  sampleRate: number;
  /** Mono, −1…1. */
  samples: Float32Array;
}

let decoder: MPEGDecoder | undefined;
let queue: Promise<unknown> = Promise.resolve();

/**
 * Decode an MP3 in this process with mpg123 built to WASM, at the clip's own
 * rate. Spawning ffmpeg cost about 43 ms a clip, nearly all of it process
 * start; this takes about 5 ms and gives the same frame count. The decoder
 * keeps stream state between calls, so clips go through it one at a time.
 */
export function decodeMp3(bytes: Uint8Array): Promise<Pcm> {
  const run = queue.then(async () => {
    decoder ??= new MPEGDecoder();
    await decoder.ready;
    const { channelData, errors, sampleRate } = decoder.decode(bytes);
    await decoder.reset();

    if (channelData.length === 0 || channelData[0].length === 0) {
      throw new Error(errors[0]?.message ?? "no audio decoded");
    }
    return { sampleRate, samples: mixDown(channelData) };
  });
  queue = run.catch(() => undefined);
  return run;
}

function mixDown(channels: Float32Array[]): Float32Array {
  if (channels.length === 1) return channels[0];

  const mixed = new Float32Array(channels[0].length);
  for (const channel of channels) {
    for (let index = 0; index < mixed.length; index += 1) {
      mixed[index] += channel[index] / channels.length;
    }
  }
  return mixed;
}
