/**
 * Save a Voice Design preview into the ElevenLabs library and lock it in config.
 *
 * Usage:
 *   bun scripts/audio/save-designed-voice.ts -- --id <generated_voice_id> --name "Slovak Wiki Tutor"
 *   bun scripts/audio/save-designed-voice.ts -- --id <generated_voice_id> --name "Slovak Wiki Tutor" --model eleven_v3
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AudioConfig } from "../../src/lib/content/audio";
import { ROOT } from "../lib/paths";
import { CONFIG_PATH } from "./shared";

function parseArgs(argv: string[]): {
  id: string;
  model: string;
  name: string;
} {
  let id = "";
  let name = "Slovak Wiki Tutor";
  let model = "eleven_v3";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--id") {
      id = argv[i + 1] ?? "";
      i += 1;
    } else if (arg === "--name") {
      name = argv[i + 1] ?? name;
      i += 1;
    } else if (arg === "--model") {
      model = argv[i + 1] ?? model;
      i += 1;
    }
  }

  if (!id) throw new Error("Missing --id <generated_voice_id>");
  return { id, model, name };
}

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const { id, model, name } = parseArgs(process.argv.slice(2));

  const catalogPath = path.join(ROOT, "static", "audio", "voice-design", "catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as {
    previews: Array<{ generatedVoiceId: string; label: string; prompt: string }>;
  };
  const match = catalog.previews.find((preview) => preview.generatedVoiceId === id);
  const description =
    match?.prompt ??
    "Custom Slovak female teaching voice for slovak.wiki dictionary pronunciation.";

  const response = await fetch("https://api.elevenlabs.io/v1/text-to-voice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      voice_name: name,
      voice_description: description,
      generated_voice_id: id,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Save voice failed (${response.status}): ${body.slice(0, 800)}`);
  }

  const created = (await response.json()) as { voice_id: string; name: string };
  const previous = JSON.parse(await readFile(CONFIG_PATH, "utf8")) as AudioConfig;

  const next: AudioConfig = {
    ...previous,
    voiceId: created.voice_id,
    voiceName: created.name || name,
    modelId: model,
    // Slightly steadier for dictionary reads
    voiceSettings: {
      ...previous.voiceSettings,
      stability: 0.6,
      style: 0,
      speed: 0.88,
    },
  };

  await writeFile(CONFIG_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  console.log(`Saved voice: ${next.voiceName} (${next.voiceId})`);
  console.log(`Locked model: ${next.modelId}`);
  console.log(`Updated ${CONFIG_PATH}`);
  console.log("Next: bun run audio:generate -- --force --limit 10");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
