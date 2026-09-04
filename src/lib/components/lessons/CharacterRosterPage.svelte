<script lang="ts">
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import {
    getVoiceRoster,
    type VoiceRosterEntry,
  } from "$lib/catalog/lessons/voice-roster";

  const roster = getVoiceRoster();

  function kindLabel(kind: VoiceRosterEntry["kind"]): string {
    if (kind === "system") return "System";
    if (kind === "recurring") return "Recurring";
    return "One-off";
  }

  function genderLabel(gender: VoiceRosterEntry["gender"]): string {
    if (gender === "female") return "Female";
    if (gender === "male") return "Male";
    return "Neutral";
  }
</script>

<main class="py-12 pb-24 max-[600px]:py-8">
  <PageShell class="max-w-[1040px]">
    <header class="max-w-[680px]">
      <p
        class="m-0 font-mono text-xs font-medium tracking-widest text-blue-700 uppercase"
      >
        Cast & Audio
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
        Characters & voices
      </h1>
      <Lead class="mt-3">
        Every cast portrait and ElevenLabs Slovak voice used across lessons and dictionary
        audio.
      </Lead>
    </header>

    <ul class="mt-10 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {#each roster as character (character.id)}
        <li
          class="flex flex-col justify-between rounded-(--frame-radius) bg-surface p-6 ring-1 ring-slate-200 ring-inset"
        >
          <div class="flex flex-col items-center text-center">
            <LessonCharacterAvatar characterId={character.id} size="xl" />

            <h2 class="m-0 mt-4 font-serif text-xl font-semibold text-blue-950">
              {character.displayName}
            </h2>

            <div class="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <span
                class="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 font-sans text-xs font-medium text-slate-600 ring-1 ring-slate-200 ring-inset"
              >
                {kindLabel(character.kind)}
              </span>
              <span
                class="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 font-sans text-xs font-medium text-blue-700 ring-1 ring-blue-200/60 ring-inset"
              >
                {genderLabel(character.gender)}
              </span>
            </div>

            <p class="m-0 mt-3 font-sans text-sm leading-relaxed text-slate-600">
              {character.blurb}
            </p>
          </div>

          <div
            class="mt-5 rounded-lg border border-slate-200/80 bg-slate-50/70 p-3.5 text-left transition-colors"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="m-0 font-sans text-sm font-medium text-slate-900">
                  {character.sampleSlovak}
                </p>
                <p class="m-0 mt-0.5 font-sans text-xs text-slate-500">
                  {character.sampleEnglish}
                </p>
              </div>

              <AudioButton
                label="Hear {character.displayName}"
                size="md"
                src={character.audioSrc}
                text={character.sampleSlovak}
              />
            </div>

            <div class="mt-2.5 border-t border-slate-200/60 pt-2">
              <p class="m-0 font-mono text-[11px] text-slate-500">
                {character.voiceName}
              </p>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </PageShell>
</main>
