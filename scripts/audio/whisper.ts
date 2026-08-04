/**
 * Local faster-whisper STT for audio QA (requires Python + faster-whisper).
 */

import { spawn } from "node:child_process";
import path from "node:path";

import { ROOT } from "../lib/paths";

const SCRIPT = path.join(ROOT, "scripts", "audio", "whisper_transcribe.py");

export interface WhisperResult {
  language?: string;
  language_probability?: number;
  text: string;
}

function pythonBin(): string {
  return (
    process.env.AUDIO_WHISPER_PYTHON?.trim() ||
    (process.platform === "win32" ? "py" : "python3")
  );
}

export async function transcribeWithWhisper(
  audioPath: string,
  options?: { model?: string },
): Promise<WhisperResult> {
  const model = options?.model ?? "small";
  const bin = pythonBin();
  const args =
    process.platform === "win32" && bin === "py"
      ? ["-3", SCRIPT, audioPath, "--model", model, "--language", "sk"]
      : [SCRIPT, audioPath, "--model", model, "--language", "sk"];

  const { stdout, stderr, code } = await run(bin, args);
  if (code !== 0) {
    throw new Error(
      `whisper_transcribe failed (${code}): ${stderr || stdout}`.slice(0, 800),
    );
  }

  const parsed = JSON.parse(stdout) as WhisperResult & { error?: string };
  if (parsed.error) throw new Error(parsed.error);
  if (typeof parsed.text !== "string") throw new Error("whisper returned no text");
  return parsed;
}

function run(
  command: string,
  args: string[],
): Promise<{ code: number | null; stderr: string; stdout: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}
