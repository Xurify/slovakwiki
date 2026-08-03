/**
 * Design custom teaching voices via ElevenLabs Voice Design (ttv v3),
 * then write preview MP3s under static/audio/voice-design/ (gitignored).
 *
 * Usage: bun scripts/audio/design-teaching-voice.ts
 * Save pick: bun scripts/audio/save-designed-voice.ts -- --id <generated_voice_id> --name "…"
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";

const DESIGN_MODEL = "eleven_ttv_v3";

/** Slovak sample long enough for Voice Design (100–1000 chars). */
const PREVIEW_TEXT = [
  "Ahoj. Volám sa Anna.",
  "Ďakujem pekne. Prosím.",
  "Hovoríte po slovensky? Ešte sa učím.",
  "Dobrý deň. Teší ma.",
  "Kde je Bratislava?",
  "Ahoj, ako sa máš?",
  "Ďakujem za pomoc.",
  "Čítam knihu. Píšem list.",
].join(" ");

const PROMPTS = [
  {
    folder: "dictionary-neutral",
    label: "Dictionary neutral",
    description:
      "A clear young-adult Slovak woman speaking Standard Slovak for a language-learning dictionary app. Neutral, precise, and highly articulate. Steady even pace, even volume, minimal emotion. Sounds like a pronunciation model or glossary reader — not an audiobook narrator, not storytelling, not soft or cozy.",
  },
  {
    folder: "classroom-tutor",
    label: "Classroom tutor",
    description:
      "A professional female Slovak language tutor around age 28. Crisp consonants, careful vowels, calm instructional tone. Slightly slower than casual conversation for learners. Clear and patient. Not dramatic, not ASMR, not radio storytelling, not warm bedtime-story delivery.",
  },
  {
    folder: "app-crisp",
    label: "App crisp",
    description:
      "A bright but restrained adult woman with a natural Slovak accent for modern e-learning. Clean, contemporary, app-like delivery. Friendly without being cozy or theatrical. Optimized for short dictionary headwords and example sentences with maximum intelligibility.",
  },
] as const;

interface DesignPreview {
  audio_base_64: string;
  generated_voice_id: string;
  media_type: string;
  duration_secs: number;
  language: string | null;
}

interface DesignResponse {
  previews: DesignPreview[];
  text: string;
}

interface PreviewMeta {
  designModel: string;
  folder: string;
  generatedVoiceId: string;
  label: string;
  language: string | null;
  previewIndex: number;
  prompt: string;
  sampleFile: string;
}

async function designVoice(
  apiKey: string,
  description: string,
): Promise<DesignResponse> {
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-voice/design", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      voice_description: description,
      model_id: DESIGN_MODEL,
      text: PREVIEW_TEXT,
      auto_generate_text: false,
      should_enhance: true,
      guidance_scale: 4,
      loudness: 0.45,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Voice design failed (${response.status}): ${body.slice(0, 800)}`);
  }

  return (await response.json()) as DesignResponse;
}

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  if (PREVIEW_TEXT.length < 100 || PREVIEW_TEXT.length > 1000) {
    throw new Error(`Preview text length ${PREVIEW_TEXT.length} out of 100–1000`);
  }

  const outRoot = path.join(ROOT, "static", "audio", "voice-design");
  await rm(outRoot, { recursive: true, force: true });
  await mkdir(outRoot, { recursive: true });

  const catalog: PreviewMeta[] = [];

  for (const prompt of PROMPTS) {
    console.log(`--- Designing: ${prompt.label}`);
    const designed = await designVoice(apiKey, prompt.description);
    const dir = path.join(outRoot, prompt.folder);
    await mkdir(dir, { recursive: true });

    console.log(`  got ${designed.previews.length} previews`);

    for (const [index, preview] of designed.previews.entries()) {
      const sampleFile = `preview-${index + 1}.mp3`;
      const bytes = Buffer.from(preview.audio_base_64, "base64");
      await writeFile(path.join(dir, sampleFile), bytes);

      catalog.push({
        designModel: DESIGN_MODEL,
        folder: prompt.folder,
        generatedVoiceId: preview.generated_voice_id,
        label: prompt.label,
        language: preview.language,
        previewIndex: index + 1,
        prompt: prompt.description,
        sampleFile,
      });

      console.log(
        `  ok ${prompt.folder}/${sampleFile} id=${preview.generated_voice_id} (${bytes.byteLength} B)`,
      );
    }
  }

  await writeFile(
    path.join(outRoot, "catalog.json"),
    `${JSON.stringify({ designModel: DESIGN_MODEL, previewText: PREVIEW_TEXT, previews: catalog }, null, 2)}\n`,
  );

  console.log(`Wrote ${catalog.length} previews → ${outRoot}`);
  console.log("Listen to files in that folder, then save with save-designed-voice.ts");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
