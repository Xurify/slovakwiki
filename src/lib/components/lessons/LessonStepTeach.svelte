<script lang="ts">
  import { eyebrowMutedClass, panelClass } from "$lib/components/ui/system-ui";
  import { onMount } from "svelte";
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import FormTable from "$lib/components/lessons/FormTable.svelte";
  import MarkedNote from "$lib/components/lessons/MarkedNote.svelte";
  import LessonStoryLine from "$lib/components/lessons/LessonStoryLine.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { STORY_PREFS_CHANGE_EVENT, getStoryShowEnglish } from "$lib/lesson-story/prefs";
  import { ClockIllustration } from "$lib/learning/time";
  import type { DialogueTurn, KeyPhrase, LessonBeatTeach } from "$lib/learning/types";

  /**
   * One idea of the lesson: the lines of the scene that show it, then what
   * to take from them. The scene itself plays on the stage at the start, so
   * the lines here sit still, each with its clip.
   */
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

  let showEnglishOn = $state(getStoryShowEnglish() === "on");

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

  const visualHeadingClass = `${eyebrowMutedClass} mb-4`;

  const visuals = $derived(teach.visual ? [teach.visual].flat() : []);

  onMount(() => {
    showEnglishOn = getStoryShowEnglish() === "on";

    function onPrefsChange(): void {
      showEnglishOn = getStoryShowEnglish() === "on";
    }

    window.addEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
    return () => window.removeEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
  });
</script>

<div class="mx-auto w-full max-w-[640px] px-4 py-8 sm:px-8 sm:py-10">
  <h2 class="m-0 font-serif text-xl tracking-tight text-pretty text-slate-900 sm:text-2xl">
    {title}
  </h2>

  {#if scene.length}
    <ol class="{dataPanelClass} m-0 mt-6 list-none p-0">
      {#each scene as line (line.id)}
        <LessonStoryLine
          {line}
          audioSrc={audioSrcs[line.id] ?? line.audio?.src}
          showEnglish={showEnglishOn}
        />
      {/each}
    </ol>
  {/if}

  {#if takeaways.length || teach.note || visuals.length}
    <div class="mt-8 grid gap-6 {scene.length ? 'border-t border-slate-200/80 pt-8' : ''}">
    {#if takeaways.length}
      <div>
        <h3 class={visualHeadingClass}>
          {takeaways.length === 1 ? "Key term" : "Key terms"}
        </h3>

        <ul class="{dataPanelClass} m-0 list-none p-0">
          {#each takeaways as phrase (phrase.slovak)}
            <li
              class="flex items-start justify-between gap-4 border-b border-slate-200/70 px-4 py-3.5 last:border-b-0 sm:px-5"
            >
              <div class="min-w-0">
                <p
                  class="m-0 font-serif text-lg font-semibold leading-snug text-slate-900"
                  lang="sk"
                >
                  {phrase.slovak}
                </p>

                <p class="m-0 mt-0.5 text-sm text-slate-600">{phrase.english}</p>

                {#if phrase.note}
                  <p class="m-0 mt-2 text-sm leading-relaxed text-slate-500">
                    <MarkedNote text={phrase.note} />
                  </p>
                {/if}
              </div>

              {#if audioSrcs[phrase.slovak] ?? phrase.audio?.src}
                <AudioButton
                  size="sm"
                  src={audioSrcs[phrase.slovak] ?? phrase.audio?.src}
                  text={phrase.audio?.transcript ?? phrase.slovak}
                  label={`Listen: ${phrase.slovak}`}
                />
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if teach.note}
      <p
        class="m-0 max-w-[62ch] text-[1.02rem] leading-relaxed text-pretty text-slate-800"
      >
        <MarkedNote text={teach.note} />
      </p>
    {/if}

    {#each visuals as visual (visual.title)}
      {#if visual.type === "clock-grid"}
        <div>
          <h3 class={visualHeadingClass}>
            {visual.title}
          </h3>

          <ul
            class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-4 p-0"
          >
            {#each visual.items as item (`${item.slovak}-${item.time.hour}-${item.time.minute}`)}
              <li class="{panelClass} grid justify-items-center gap-1.5 px-3 py-4">
                <ClockIllustration
                  hour={item.time.hour}
                  minute={item.time.minute}
                  size={84}
                />

                <strong
                  class="text-center font-serif text-sm text-slate-900"
                  lang="sk"
                >
                  {item.slovak}
                </strong>

                <span class="text-center text-xs text-slate-500">{item.english}</span>
              </li>
            {/each}
          </ul>
        </div>
      {:else}
        <FormTable table={visual} />
      {/if}
    {/each}
    </div>
  {/if}
</div>
