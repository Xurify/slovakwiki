<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { onMount } from "svelte";
  import FormTable from "$lib/components/lessons/FormTable.svelte";
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import MarkedNote from "$lib/components/lessons/MarkedNote.svelte";
  import LessonStoryLine from "$lib/components/lessons/LessonStoryLine.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { STORY_PREFS_CHANGE_EVENT, getStoryShowEnglish } from "$lib/lesson-story/prefs";
  import { ClockIllustration } from "$lib/learning/time";
  import { cx } from "$lib/ui/classes";
  import type {
    DialogueTurn,
    KeyPhrase,
    LessonBeatTeach,
    LessonVisual,
  } from "$lib/learning/types";

  /**
   * One idea of the lesson: the lines of the scene that show it, then what
   * to take from them. The scene itself plays on the stage at the start, so
   * the lines here sit still, each with its clip.
   */
  let {
    audioSrcs = {},
    beside = false,
    class: className = "mx-auto w-full max-w-[640px] px-4 pt-5 pb-10 sm:px-8 sm:pt-6",
    scene = [],
    teach,
    title,
  }: {
    audioSrcs?: Record<string, string>;
    /** The stage stands beside the step on a wide screen: the heading sits next to it and the phrases run full width under both. */
    beside?: boolean;
    class?: string;
    scene?: DialogueTurn[];
    teach: LessonBeatTeach;
    title: string;
  } = $props();

  let showEnglishOn = $state(getStoryShowEnglish() === "on");

  const takeaways = $derived.by((): KeyPhrase[] => {
    const all = teach.phrases ?? [];
    if (!all.length || !scene.length) return all;

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

  /** Takeaways under their group's title, groups in order of first use; ungrouped phrases form one untitled group. */
  const phraseGroups = $derived.by((): { phrases: KeyPhrase[]; title?: string }[] => {
    const groups: { phrases: KeyPhrase[]; title?: string }[] = [];
    for (const phrase of takeaways) {
      const existing = groups.find((group) => group.title === phrase.group);
      if (existing) existing.phrases.push(phrase);
      else groups.push({ phrases: [phrase], title: phrase.group });
    }
    return groups;
  });

  const visualHeadingClass = `${eyebrowMutedClass} mb-4`;

  /** Slovak typesetting keeps a one-letter preposition (o, v, s, k, z, a, i, u) off the end of a line. */
  function keepPrepositions(text: string): string {
    return text.replace(/(^|\s)([aikosuvz])\s/gi, "$1$2\u00a0");
  }

  const visuals = $derived(teach.visual ? [teach.visual].flat() : []);

  /**
   * Beside the stage, a long list or a table runs full width under it; a short one stays in the
   * column next to it, where three phrases spread over the whole width read as scattered.
   */
  const spread = $derived(beside && (takeaways.length > 4 || visuals.length > 0));
  /** The most form columns of any table on the step, at least three, so no lone table stretches. */
  const slots = $derived(
    Math.max(
      3,
      ...visuals.map((visual) => (visual.type === "form-table" ? visual.columns.length : 0)),
    ),
  );

  onMount(() => {
    showEnglishOn = getStoryShowEnglish() === "on";

    function onPrefsChange(): void {
      showEnglishOn = getStoryShowEnglish() === "on";
    }

    window.addEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
    return () => window.removeEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
  });
</script>

<div class={cx(className, spread && "lg:contents")}>
  <div class={cx(spread && "lg:col-start-2 lg:row-start-1 lg:self-center lg:pt-10")}>
    <h2 class="m-0 font-serif text-xl tracking-tight text-pretty text-slate-900 sm:text-2xl">
      {title}
    </h2>

    {#if scene.length}
      <ol class="{dataPanelClass} m-0 mt-5 list-none p-0">
        {#each scene as line (line.id)}
          <LessonStoryLine
            {line}
            audioSrc={audioSrcs[line.id] ?? line.audio?.src}
            showEnglish={showEnglishOn}
          />
        {/each}
      </ol>
    {/if}

    {#if teach.note}
      <p class="m-0 mt-3 max-w-[60ch] leading-relaxed text-pretty text-slate-700">
        <MarkedNote text={teach.note} />
      </p>
    {/if}
  </div>

  <div class={cx(spread && "lg:col-span-2 lg:pb-10")}>
    {#if takeaways.length}
      <div class="mt-8 grid gap-10">
        {#each phraseGroups as group (group.title ?? "")}
          <section>
            {#if group.title}
              <h3 class="m-0 mb-4 text-lg font-semibold text-slate-900">
                {group.title}
              </h3>
            {/if}

            <!-- No lines or boxes: the space between entries does the grouping, like a printed phrasebook. -->
            <dl
              class={cx(
                "m-0 grid gap-x-10 gap-y-6 sm:grid-cols-2",
                spread && "lg:grid-cols-3",
              )}
            >
              {#each group.phrases as phrase (phrase.slovak)}
                {@const src = audioSrcs[phrase.slovak] ?? phrase.audio?.src}
                {@const shown = keepPrepositions(phrase.slovak).replace(/ …$/, "\u00a0…")}
                {@const cut = shown.lastIndexOf(" ") + 1}

                <div class="min-w-0">
                  <!-- The last word and the button wrap together, so the button never sits alone on a line or out at the column's edge. -->
                  <dt class="font-serif text-xl leading-snug font-semibold text-slate-900">
                    <span lang="sk">{shown.slice(0, cut)}</span><span
                      class="whitespace-nowrap"
                      ><span lang="sk">{shown.slice(cut)}</span>{#if src}<AudioButton
                          class="ml-1.5 align-[-0.35rem]"
                          size="xs"
                          {src}
                          text={phrase.slovak}
                        />{/if}</span
                    >
                  </dt>

                  <dd class="m-0 mt-0.5 text-sm leading-snug text-slate-800">{phrase.english}</dd>

                  {#if phrase.note}
                    <dd class="m-0 mt-1 text-[13px] leading-normal text-pretty text-slate-500">
                      <MarkedNote text={phrase.note} />
                    </dd>
                  {/if}
                </div>
              {/each}
            </dl>
          </section>
        {/each}
      </div>
    {/if}

    {#each visuals as visual, index (visual.title)}
      <div class={cx("mt-8", spread && "lg:max-w-3xl")}>
        <details class="group" open={index === 0}>
            <!-- Set like the title of the table above it, so an open and a closed table read as one kind. -->
            <summary
              class="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden"
            >
              <!-- One flex item: the marks inside the title would each take the gap, a space before every comma. -->
              <span><MarkedNote text={visual.title} /></span>

              <svg
                class="size-4 shrink-0 fill-none stroke-current stroke-2 text-slate-500 transition-transform duration-150 ease-out group-open:rotate-180"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </summary>

            <div class="mt-4">
              {@render visualBody(visual, false)}
            </div>
          </details>
      </div>
    {/each}
  </div>
</div>

{#snippet visualBody(visual: LessonVisual, titled = true)}
  {#if visual.type === "clock-grid"}
    {#if titled}
      <h3 class={visualHeadingClass}>
        {visual.title}
      </h3>
    {/if}

    <ul
      class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] items-start gap-x-6 gap-y-4 p-0"
    >
      {#each visual.items as item (`${item.slovak}-${item.time.hour}-${item.time.minute}`)}
        <li class="grid justify-items-start gap-1.5 py-2">
          <ClockIllustration hour={item.time.hour} minute={item.time.minute} size={84} />

          <strong class="font-serif text-sm text-slate-900" lang="sk">
            {item.slovak}
          </strong>

          <span class="grid text-xs text-slate-500">
            {#each item.english.split(/\s(?=→)/) as part (part)}
              <span>{keepPrepositions(part)}</span>
            {/each}
          </span>
        </li>
      {/each}
    </ul>
  {:else}
    <FormTable table={visual} {slots} {titled} />
  {/if}
{/snippet}
