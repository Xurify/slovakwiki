/**
 * Design + save ElevenLabs Voice Design cast for lessons.
 *
 * Live IDs / cast: content/audio/config.json → characters
 *
 * Flow:
 *   1. POST /v1/text-to-voice/design  → preview MP3s in tmp/voice-design/
 *   2. POST /v1/text-to-voice         → save chosen preview to library
 *   3. Patch content/audio/config.json character voiceIds
 *
 * Usage:
 *   bun run audio:voice-design -- --dry-run
 *   bun run audio:voice-design                 # design only (previews)
 *   bun run audio:voice-design -- --create     # design + save preview 0 + update config
 *   bun run audio:voice-design -- --create --pick 1
 *   bun run audio:voice-design -- --only anna,alex --create
 *
 * Needs Voice Design access on ELEVENLABS_API_KEY.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AudioConfig } from "../../src/lib/content/audio";
import { ROOT } from "../lib/paths";
import { CONFIG_PATH, loadConfig, sleep } from "./shared";

const OUT_DIR = path.join(ROOT, "tmp", "voice-design");

/** Slovak sample — long enough for Voice Design (100–1000 chars). */
const SAMPLE_TEXT = [
  "Dobrý deň. Volám sa Anna a teší ma, že vás spoznávam.",
  "Odkiaľ ste? Ja som zo Slovenska, ale teraz bývam v Bratislave.",
  "Hovoríte po slovensky? Trochu, ešte sa učím, ale každý deň sa snažím.",
  "Môžete mi, prosím, pomôcť? Ďakujem veľmi pekne za trpezlivosť.",
].join(" ");

interface CastBrief {
  characterId: string;
  displayName: string;
  gender: "female" | "male" | "neutral";
  voiceDescription: string;
  voiceName: string;
}

/** Core lesson cast — designed specifically for Slovak Wiki dialogue. */
const CAST: CastBrief[] = [
  {
    characterId: "anna",
    displayName: "Anna",
    gender: "female",
    voiceName: "Slovak Wiki Anna",
    voiceDescription:
      "Young adult Slovak woman, about 25, warm and friendly peer. Clear Central European accent, natural conversational tone, medium pitch, slight smile in the voice. Good for everyday greetings and introductions. Not American, not British — Eastern European / Slovak learner-friendly clarity.",
  },
  {
    characterId: "maria",
    displayName: "Mária",
    gender: "female",
    voiceName: "Slovak Wiki Mária",
    voiceDescription:
      "Mature Slovak woman, about 40, calm and professional but kind. Slightly lower pitch than a young peer, clear diction for forms and registration dialogue. Warm office receptionist energy, Central European accent, steady paced speech.",
  },
  {
    characterId: "alex",
    displayName: "Alex",
    gender: "male",
    voiceName: "Slovak Wiki Alex",
    voiceDescription:
      "Young adult Slovak man, about 28, friendly learner/partner voice. Clear medium pitch, natural and approachable, not deep or gravelly. Central European accent suitable for dialogue labeled as the learner (You). Conversational, confident but humble.",
  },
  {
    characterId: "waiter",
    displayName: "Waiter",
    gender: "male",
    voiceName: "Slovak Wiki Waiter",
    voiceDescription:
      "Adult Slovak man, about 35, café waiter. Warm service voice, slightly deeper than a young peer, polite and brisk. Central European accent, clear menu and question intonation. Friendly hospitality energy without sounding theatrical.",
  },
  {
    characterId: "receptionist",
    displayName: "Receptionist",
    gender: "female",
    voiceName: "Slovak Wiki Receptionist",
    voiceDescription:
      "Adult Slovak woman, about 32, hotel or clinic front desk. Polished professional female voice, clear and helpful, medium pitch. Central European accent, calm pacing for check-in questions. Distinct from a casual friend — more formal service tone.",
  },
  {
    characterId: "guide",
    displayName: "Guide",
    gender: "neutral",
    voiceName: "Slovak Wiki Guide",
    voiceDescription:
      "Clear instructional Slovak voice for key phrases and teaching lines. Neutral adult tone, precise diction, slightly slower than casual chat, high intelligibility for language learners. Central European accent, neither overly deep nor high — balanced guide narrator for apps.",
  },
];

interface DesignPreview {
  audio_base_64: string;
  duration_secs: number;
  generated_voice_id: string;
  language: string | null;
  media_type: string;
}

interface DesignResponse {
  previews: DesignPreview[];
  text: string;
}

interface CreatedVoice {
  voice_id: string;
  name?: string;
}

function parseArgs(argv: string[]): {
  create: boolean;
  dryRun: boolean;
  only: Set<string> | undefined;
  pick: number;
} {
  let create = false;
  let dryRun = false;
  let only: Set<string> | undefined;
  let pick = 0;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--create") create = true;
    else if (arg === "--dry-run") dryRun = true;
    else if (arg === "--pick") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--pick requires a non-negative index");
      }
      pick = Math.floor(value);
      i += 1;
    } else if (arg === "--only") {
      const raw = argv[i + 1];
      if (!raw) throw new Error("--only requires comma-separated character ids");
      only = new Set(
        raw
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      );
      i += 1;
    }
  }

  return { create, dryRun, only, pick };
}

async function designVoice(brief: CastBrief, apiKey: string): Promise<DesignResponse> {
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-voice/design", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      voice_description: brief.voiceDescription,
      model_id: "eleven_multilingual_ttv_v2",
      text: SAMPLE_TEXT,
      auto_generate_text: false,
      should_enhance: true,
      guidance_scale: 4,
      loudness: 0.5,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `design ${brief.characterId}: ${response.status} ${body.slice(0, 500)}`,
    );
  }

  return (await response.json()) as DesignResponse;
}

async function createVoice(
  brief: CastBrief,
  generatedVoiceId: string,
  apiKey: string,
): Promise<CreatedVoice> {
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-voice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      voice_name: brief.voiceName,
      voice_description: brief.voiceDescription,
      generated_voice_id: generatedVoiceId,
      labels: {
        accent: "slovak",
        gender: brief.gender,
        use_case: "lessons",
        character: brief.characterId,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `create ${brief.characterId}: ${response.status} ${body.slice(0, 500)}`,
    );
  }

  return (await response.json()) as CreatedVoice;
}

async function patchConfig(
  updates: Array<{ characterId: string; voiceId: string; voiceName: string }>,
): Promise<void> {
  const config = JSON.parse(await readFile(CONFIG_PATH, "utf8")) as AudioConfig;
  if (!config.characters) config.characters = {};

  for (const update of updates) {
    const existing = config.characters[update.characterId];
    if (!existing) {
      throw new Error(`config missing character ${update.characterId}`);
    }
    config.characters[update.characterId] = {
      ...existing,
      voiceId: update.voiceId,
      voiceName: update.voiceName,
      note: `${existing.note ?? ""} Custom Voice Design.`.trim(),
    };
  }

  // Spares inherit closest designed voices until we mint dedicated ones.
  if (config.characters.lucia && config.characters.anna) {
    config.characters.lucia = {
      ...config.characters.lucia,
      voiceId: config.characters.anna.voiceId,
      voiceName: `${config.characters.anna.voiceName} (spare→anna)`,
      note: "Spare female — temporarily shares Anna until dedicated design.",
    };
  }
  if (config.characters.marek && config.characters.alex) {
    config.characters.marek = {
      ...config.characters.marek,
      voiceId: config.characters.alex.voiceId,
      voiceName: `${config.characters.alex.voiceName} (spare→alex)`,
      note: "Spare male — temporarily shares Alex until dedicated design.",
    };
  }

  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing (set in .env)");

  const { create, dryRun, only, pick } = parseArgs(process.argv.slice(2));
  const briefs = CAST.filter((brief) => !only || only.has(brief.characterId));

  if (briefs.length === 0) {
    throw new Error("--only matched 0 cast members");
  }

  await loadConfig();
  await mkdir(OUT_DIR, { recursive: true });

  console.log(
    `Voice design: ${briefs.length} characters` +
      ` (sample=${SAMPLE_TEXT.length} chars, pick=${pick}` +
      `${create ? ", create+config" : ", previews only"}` +
      `${dryRun ? ", dry-run" : ""})`,
  );
  console.log(`Previews → ${OUT_DIR}`);

  const created: Array<{ characterId: string; voiceId: string; voiceName: string }> = [];

  for (const brief of briefs) {
    console.log(`\n→ ${brief.characterId} (${brief.gender}): ${brief.voiceName}`);

    if (dryRun) {
      console.log(`  [dry-run] would design: ${brief.voiceDescription.slice(0, 80)}…`);
      continue;
    }

    const designed = await designVoice(brief, apiKey);
    console.log(`  previews=${designed.previews.length} textLang sample ready`);

    const charDir = path.join(OUT_DIR, brief.characterId);
    await mkdir(charDir, { recursive: true });

    const meta: Array<{
      durationSecs: number;
      generatedVoiceId: string;
      index: number;
      language: string | null;
      path: string;
    }> = [];

    for (const [index, preview] of designed.previews.entries()) {
      const fileName = `preview-${index}.mp3`;
      const filePath = path.join(charDir, fileName);
      await writeFile(filePath, Buffer.from(preview.audio_base_64, "base64"));
      meta.push({
        index,
        generatedVoiceId: preview.generated_voice_id,
        durationSecs: preview.duration_secs,
        language: preview.language,
        path: path.relative(ROOT, filePath),
      });
      console.log(
        `  saved ${fileName} (${preview.duration_secs.toFixed(1)}s, lang=${preview.language ?? "?"})`,
      );
    }

    await writeFile(
      path.join(charDir, "meta.json"),
      `${JSON.stringify(
        {
          characterId: brief.characterId,
          voiceName: brief.voiceName,
          voiceDescription: brief.voiceDescription,
          sampleText: designed.text,
          previews: meta,
          designedAt: new Date().toISOString(),
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    if (create) {
      const chosen = designed.previews[pick];
      if (!chosen) {
        throw new Error(`${brief.characterId}: no preview at --pick ${pick}`);
      }

      const voice = await createVoice(brief, chosen.generated_voice_id, apiKey);
      if (!voice.voice_id) {
        throw new Error(`${brief.characterId}: create returned no voice_id`);
      }

      created.push({
        characterId: brief.characterId,
        voiceId: voice.voice_id,
        voiceName: brief.voiceName,
      });
      console.log(`  created voice_id=${voice.voice_id}`);
    }

    await sleep(400);
  }

  if (create && !dryRun && created.length > 0) {
    await patchConfig(created);
    console.log(`\nUpdated ${CONFIG_PATH} (${created.length} characters)`);
    console.log("Next: bun run audio:generate -- --lessons-only --force");
  } else if (!create) {
    console.log("\nAudition MP3s in tmp/voice-design/{character}/preview-N.mp3");
    console.log("Then: bun run audio:voice-design -- --create --pick 0");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
