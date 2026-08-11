<script lang="ts">
  import AudioButton from "$lib/components/AudioButton.svelte";
  import LessonSceneCard from "$lib/components/lessons/LessonSceneCard.svelte";
  import { ClockIllustration } from "$lib/learning/time";
  import type { DialogueTurn, KeyPhrase, LessonBeatTeach } from "$lib/learning/types";

  let {
    audioSrcs = {},
    scene = [],
    teach,
    title,
  }: {
    audioSrcs?: Record<string, string>;
    scene?: DialogueTurn[];
    teach: LessonBeatTeach;
    title: string;
  } = $props();

  /**
   * Keep phrase cards only when they teach something the scene did not already
   * show — prefer a note (grammar / usage). Bare stem repeats get dropped.
   */
  const takeaways = $derived.by((): KeyPhrase[] => {
    const all = teach.phrases ?? [];
    if (!all.length) return [];

    const spoken = scene.map((line) => line.slovak.toLowerCase()).join(" · ");

    return all.filter((phrase) => {
      const hasNote = Boolean(phrase.note?.trim());
      const isStem = phrase.slovak.includes("…");
      const core = phrase.slovak
        .replace(/[.…]+$/g, "")
        .trim()
        .toLowerCase();
      const alreadySpoken = core.length > 0 && spoken.includes(core);

      if (hasNote) return true;
      if (isStem || alreadySpoken) return false;
      return true;
    });
  });
</script>

<div class="mx-auto grid w-full max-w-2xl gap-8 px-4 py-10 sm:px-8 sm:py-12">
  <h2
    class="m-0 text-center font-serif text-[clamp(1.35rem,3vw,1.85rem)] leading-snug tracking-tight text-balance text-slate-900"
  >
    {title}
  </h2>

  {#if scene.length}
    <ul class="m-0 grid list-none gap-4 p-0">
      {#each scene as line (line.id)}
        <li>
          <LessonSceneCard
            audioSrc={audioSrcs[line.id] ?? line.audio?.src}
            audioText={line.audio?.transcript ?? line.slovak}
            english={line.english}
            hero={scene.length === 1}
            slovak={line.slovak}
            speaker={line.speaker}
          />
        </li>
      {/each}
    </ul>
  {/if}

  {#if takeaways.length}
    <div class="grid gap-4">
      {#each takeaways as phrase (phrase.slovak)}
        <div
          class="rounded-(--frame-radius) bg-subtle px-5 py-4 shadow-(--shadow-border) sm:px-6 sm:py-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p
                class="m-0 font-serif text-[clamp(1.2rem,2.5vw,1.5rem)] font-semibold leading-snug text-slate-900"
                lang="sk"
              >
                {phrase.slovak}
              </p>

              <p class="m-0 mt-1.5 text-sm text-slate-600">{phrase.english}</p>
            </div>

            {#if audioSrcs[phrase.slovak] ?? phrase.audio?.src}
              <AudioButton
                size="sm"
                src={audioSrcs[phrase.slovak] ?? phrase.audio?.src}
                text={phrase.audio?.transcript ?? phrase.slovak}
                label={`Listen: ${phrase.slovak}`}
              />
            {/if}
          </div>

          {#if phrase.note}
            <p class="m-0 mt-3 text-sm leading-relaxed text-slate-600">
              {phrase.note}
            </p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if teach.note}
    <p
      class="m-0 rounded-(--frame-radius) bg-surface/80 px-5 py-4 font-serif text-sm leading-relaxed text-slate-700 shadow-(--shadow-border) sm:px-6"
    >
      {teach.note}
    </p>
  {/if}

  {#if teach.visual?.type === "clock-grid"}
    <div>
      <h3
        class="m-0 mb-4 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
      >
        {teach.visual.title}
      </h3>

      <ul
        class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-4 p-0"
      >
        {#each teach.visual.items as item (`${item.slovak}-${item.time.hour}-${item.time.minute}`)}
          <li
            class="grid justify-items-center gap-1.5 rounded-(--frame-radius) bg-surface/80 px-3 py-4 shadow-(--shadow-border)"
          >
            <ClockIllustration
              hour={item.time.hour}
              minute={item.time.minute}
              size={84}
            />

            <strong class="text-center font-serif text-sm text-slate-900" lang="sk">
              {item.slovak}
            </strong>

            <span class="text-center text-xs text-slate-500">{item.english}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
