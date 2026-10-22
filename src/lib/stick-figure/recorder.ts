import { voiceFrom, type Take } from "./take";

/** The microphone could not be used: `blocked` when the browser or the learner said no. */
export class MicrophoneError extends Error {
  constructor(readonly blocked: boolean) {
    super(blocked ? "Microphone blocked" : "No microphone");
  }
}

export interface Recording {
  /** How loud the microphone is now, 0–1: for a meter, and to stop once the speaker does. */
  level(): number;
  /** Stop and keep what was said: undefined when it was only silence. */
  stop(): Promise<Take | undefined>;
  cancel(): void;
}

export function canRecord(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
  );
}

/**
 * Start recording from the microphone. Nothing leaves the browser: a take
 * is an object URL of a WAV made here, trimmed to the voice.
 */
export async function record(): Promise<Recording> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
  } catch (error) {
    throw new MicrophoneError(
      error instanceof DOMException && error.name === "NotAllowedError",
    );
  }

  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  context.createMediaStreamSource(stream).connect(analyser);
  const frame = new Float32Array(analyser.fftSize);

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  recorder.start();

  const release = () => {
    for (const track of stream.getTracks()) track.stop();
  };

  return {
    level() {
      analyser.getFloatTimeDomainData(frame);
      let sum = 0;
      for (const sample of frame) sum += sample * sample;
      // Speech sits around 0.05–0.2 RMS; this puts it mid-meter.
      return Math.min(1, Math.sqrt(sum / frame.length) * 4);
    },

    stop() {
      return new Promise((resolve, reject) => {
        recorder.onstop = async () => {
          release();
          try {
            const blob = new Blob(chunks, { type: recorder.mimeType });
            const audio = await context.decodeAudioData(await blob.arrayBuffer());
            const voice = voiceFrom(audio.getChannelData(0), audio.sampleRate);
            resolve(
              voice && {
                durationMs: voice.durationMs,
                mouth: voice.mouth,
                src: URL.createObjectURL(new Blob([voice.wav], { type: "audio/wav" })),
              },
            );
          } catch (error) {
            reject(error);
          } finally {
            void context.close();
          }
        };
        recorder.stop();
      });
    },

    cancel() {
      recorder.onstop = null;
      if (recorder.state !== "inactive") recorder.stop();
      release();
      void context.close();
    },
  };
}
