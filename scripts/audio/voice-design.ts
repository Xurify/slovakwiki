/**
 * Design + save ElevenLabs Voice Design cast for lessons.
 *
 * Roster / usage: content/audio/README.md
 * Live IDs: content/audio/config.json → characters
 *
 * Flow:
 *   1. POST /v1/text-to-voice/design  → preview MP3s in tmp/voice-design/
 *   2. POST /v1/text-to-voice         → save chosen preview to library
 *   3. Patch content/audio/config.json character voiceIds
 *
 * Usage:
 *   bun scripts/audio/voice-design.ts -- --dry-run
 *   bun scripts/audio/voice-design.ts                 # design only (previews)
 *   bun scripts/audio/voice-design.ts -- --create     # design + save preview 0 + update config
 *   bun scripts/audio/voice-design.ts -- --create --pick 1
 *   bun scripts/audio/voice-design.ts -- --only anna,alex --create
 *   bun scripts/audio/voice-design.ts -- --only waiter --keep 1   # save preview 1 of the last design
 *
 * Needs Voice Design access on ELEVENLABS_API_KEY.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AudioConfig } from "../../src/lib/catalog/audio/core";
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
  /** What the previews say; the shared SAMPLE_TEXT unless the part needs its own talk. */
  sampleText?: string;
  voiceDescription: string;
  voiceName: string;
}

/**
 * What a waiter actually says at a table, so the design hears talk, not a
 * read passage: the shared sample is a learner's introduction, and every
 * take made on it came out reading it, like an audiobook.
 */
const WAITER_TALK = [
  "Dobrý deň, nech sa páči, sadnite si. Čo si dáte?",
  "Kávu? Jasné. Espresso, alebo s mliekom?",
  "A dáte si k tomu aj niečo sladké? Dnes máme makový koláč, je naozaj dobrý.",
  "Dobre, takže dve kávy a jeden koláč. Hneď to bude.",
  "Nech sa páči. Keby ste ešte niečo potrebovali, stačí zavolať.",
].join(" ");

/**
 * Robo's own lines in the dog story, so the design hears a robot in a flat
 * with a dog, not a learner reading an introduction.
 */
const ROBO_TALK = [
  "Dobré ráno. Som Robo, váš nový domáci robot.",
  "Dobre, Marek. Tykám ti. Viem po slovensky, po anglicky, po nemecky. Viem sto jazykov.",
  "Prepáč. Tento jazyk neviem.",
  "Bobík, je jedenásť. Von ideme o dvanástej. Taký je plán.",
  "Hľadám v slovníku. Haf: zvuk psa. To viem aj ja.",
  "Bobík? Tento haf je iný. Je tichý. Sedíš pri okne. Čakáš na Mareka.",
  "Ráno sto. Teraz stojeden.",
].join(" ");

/**
 * Domo at Marek's flat, from his own lines: a household robot reading out
 * his plan and talking to the dog, so the design hears him, not a lesson.
 */
const DOMO_TALK = [
  "Dobrý večer, pani Anna. Tri dni sa budem starať o Dunča.",
  "To nevadí. Mám plán. O siedmej pôjdem s Dunčom von. O ôsmej mu dám granule. Potom budem upratovať.",
  "Pán Marek, a kedy budete doma?",
  "Nerozumiem. Tento jazyk nemám.",
  "Dobre. Zmením plán. Dnes nebudem upratovať. Budem čakať s tebou.",
].join(" ");

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
    characterId: "lucia",
    displayName: "Lucia",
    gender: "female",
    voiceName: "Slovak Wiki Lucia",
    voiceDescription:
      "Young adult Slovak woman, about 26, shop assistant. Friendly, a bit brighter and more brisk than a close friend. Clear Central European accent, medium-high pitch, helpful retail energy. Distinct from Anna — not a casual peer, a shop worker.",
  },
  {
    characterId: "marek",
    displayName: "Marek",
    gender: "male",
    voiceName: "Slovak Wiki Marek",
    voiceDescription:
      "Young adult Slovak man, about 27, classmate and coworker. Clear medium pitch, slightly more reserved than a close friend, natural conversational tone. Central European accent. Distinct from Alex the learner — a local peer at work or class.",
  },
  {
    characterId: "waiter",
    displayName: "Waiter",
    gender: "male",
    voiceName: "Slovak Wiki Waiter",
    voiceDescription:
      "Slovak man of about 23 chatting with guests at their table in a small old-town café, a student who has waited tables there for a couple of years. Real everyday speech, not reading: he talks to the person in front of him, casually and off the cuff, with the loose rhythm of conversation, little lifts and drops, a half-smile in the voice, quick and light on the small talk, a rising, genuinely asked question. A young man's natural, light-warm voice, clearly an adult, recorded close in a quiet room. Not a narrator, not an audiobook, not an announcer, not a language-course recording. Central European accent.",
    sampleText: WAITER_TALK,
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
    characterId: "robot",
    displayName: "Domo",
    gender: "neutral",
    voiceName: "Slovak Wiki Domo",
    voiceDescription:
      "A small, friendly household robot speaking Slovak in a flat at home, to the people there and to their dog. A light, clean, slightly synthetic voice with an even, precise rhythm and very clear diction, polite and a little formal, earnest rather than cold, with a faint electronic sheen but fully human-intelligible. Medium pitch, neither a man nor a woman, close-miked in a quiet room. Not a narrator, not an announcer, not a menacing sci-fi robot, not a vocoder, no heavy effects. Central European accent.",
    sampleText: DOMO_TALK,
  },
  {
    characterId: "guide",
    displayName: "Guide",
    gender: "neutral",
    voiceName: "Slovak Wiki Guide",
    voiceDescription:
      "Clear instructional Slovak voice for key phrases and teaching lines. Neutral adult tone, precise diction, slightly slower than casual chat, high intelligibility for language learners. Central European accent, neither overly deep nor high — balanced guide narrator for apps.",
  },
  {
    characterId: "robo",
    displayName: "Robo",
    gender: "male",
    voiceName: "Slovak Wiki Robo",
    voiceDescription:
      "A friendly household robot in a Slovak flat, speaking Slovak to its owner and his dog. A light, clear male-leaning voice with a very slight synthetic evenness: precise consonants, tidy rhythm, short sentences said a little too exactly, as if reading from a log, but with real curiosity and a dry, gentle humour underneath. Warm, never cold or menacing, not a sci-fi villain, no heavy vocoder or metallic effect, no echo. Recorded close in a quiet room. Not a narrator, not an audiobook, not an announcer. Central European accent.",
    sampleText: ROBO_TALK,
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
  /** Save this preview of the last design in tmp/voice-design instead of designing again. */
  keep: number | undefined;
  only: Set<string> | undefined;
  pick: number;
} {
  let create = false;
  let dryRun = false;
  let keep: number | undefined;
  let only: Set<string> | undefined;
  let pick = 0;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--create") create = true;
    else if (arg === "--dry-run") dryRun = true;
    else if (arg === "--keep") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--keep requires a non-negative preview index");
      }
      keep = Math.floor(value);
      i += 1;
    } else if (arg === "--pick") {
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

  return { create, dryRun, keep, only, pick };
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
      model_id: "eleven_ttv_v3",
      text: brief.sampleText ?? SAMPLE_TEXT,
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

  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing (set in .env)");

  const { create, dryRun, keep, only, pick } = parseArgs(process.argv.slice(2));
  const briefs = CAST.filter((brief) => !only || only.has(brief.characterId));

  if (briefs.length === 0) {
    throw new Error("--only matched 0 cast members");
  }

  await loadConfig();

  if (keep !== undefined) {
    await keepPreviews(briefs, keep, apiKey);
    return;
  }
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
    console.log("Next: bun scripts/audio/generate.ts -- --lessons-only --force");
  } else if (!create) {
    console.log("\nAudition MP3s in tmp/voice-design/{character}/preview-N.mp3");
    console.log("Then: bun scripts/audio/voice-design.ts -- --create --pick 0");
  }
}

/**
 * Save preview `index` of each brief's last design, auditioned from
 * tmp/voice-design, as the character's voice. Designing again would make
 * three new previews, and the one that sounded right would be gone.
 */
async function keepPreviews(
  briefs: CastBrief[],
  index: number,
  apiKey: string,
): Promise<void> {
  const created: Array<{ characterId: string; voiceId: string; voiceName: string }> = [];

  for (const brief of briefs) {
    const metaPath = path.join(OUT_DIR, brief.characterId, "meta.json");
    const meta = JSON.parse(await readFile(metaPath, "utf8")) as {
      previews: Array<{ generatedVoiceId: string; index: number }>;
    };
    const chosen = meta.previews.find((preview) => preview.index === index);
    if (!chosen)
      throw new Error(`${brief.characterId}: no preview ${index} in ${metaPath}`);

    const voice = await createVoice(brief, chosen.generatedVoiceId, apiKey);
    if (!voice.voice_id)
      throw new Error(`${brief.characterId}: create returned no voice_id`);
    created.push({
      characterId: brief.characterId,
      voiceId: voice.voice_id,
      voiceName: brief.voiceName,
    });
    console.log(
      `→ ${brief.characterId}: kept preview ${index} as voice_id=${voice.voice_id}`,
    );
    await sleep(400);
  }

  await patchConfig(created);
  console.log(`\nUpdated ${CONFIG_PATH} (${created.length} characters)`);
  console.log("Next: bun scripts/audio/generate.ts -- --lessons-only --missing-only");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
