export interface Recording {
  audio: Blob;
  seconds: number;
}

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"];

export function canRecord(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

/** Asks once per test; the stream is reused by every speaking task. */
export async function openMicrophone(): Promise<MediaStream | null> {
  if (!canRecord()) return null;
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return null;
  }
}

export function closeMicrophone(stream: MediaStream | null): void {
  for (const track of stream?.getTracks() ?? []) track.stop();
}

/** Safari records MP4/AAC, Chrome and Firefox WebM/Opus; Scribe takes both. */
export function startRecording(stream: MediaStream): { stop: () => Promise<Recording> } {
  const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  const startedAt = performance.now();

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  recorder.start();

  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.addEventListener(
          "stop",
          () => {
            resolve({
              audio: new Blob(chunks, { type: recorder.mimeType || "audio/webm" }),
              seconds: (performance.now() - startedAt) / 1000,
            });
          },
          { once: true },
        );
        if (recorder.state === "inactive") {
          recorder.dispatchEvent(new Event("stop"));
        } else {
          recorder.stop();
        }
      }),
  };
}
