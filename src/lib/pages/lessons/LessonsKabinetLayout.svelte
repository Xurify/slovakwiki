<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import type { Lesson, LessonTrack } from "$lib/content/learning-types";
  import { lessonPath, lessons } from "$lib/content/lessons";
  import { practiceSessionCount, practiceSetForLesson } from "$lib/content/practice";

  let {
    hydrated,
    doneIds,
    doneTotal,
    nextLesson,
    trackGroups,
  }: {
    hydrated: boolean;
    doneIds: Set<string>;
    doneTotal: number;
    nextLesson: Lesson | null;
    trackGroups: Array<{ track: LessonTrack; lessons: Lesson[] }>;
  } = $props();

  let previewId = $state(lessons[0]?.id ?? "");

  const previewLesson = $derived(
    lessons.find((lesson) => lesson.id === previewId) ?? nextLesson ?? lessons[0] ?? null,
  );

  const previewTrack = $derived(
    previewLesson
      ? (trackGroups.find((group) => group.track.id === previewLesson.track)?.track ??
          null)
      : null,
  );

  const previewPhrase = $derived(previewLesson?.keyPhrases[0] ?? null);
  const morePhrases = $derived(previewLesson?.keyPhrases.slice(1, 4) ?? []);

  const previewRefs = $derived(
    (previewLesson?.referenceLinks ?? []).filter(
      (link) =>
        link.href.startsWith("/grammar/") || link.href.startsWith("/pronunciation/"),
    ),
  );

  const previewPractice = $derived(
    previewLesson ? practiceSetForLesson(previewLesson.id) : undefined,
  );

  const patternNote = $derived.by(() => {
    const pattern = previewLesson?.pattern?.title?.trim();
    if (!pattern) return "";
    if (pattern === previewLesson?.promise) return "";
    return pattern;
  });

  const openLabel = $derived(
    previewLesson && doneIds.has(previewLesson.id) ? "Open again" : "Open lesson",
  );

  let syncedNext = $state(false);

  $effect(() => {
    if (!hydrated || !nextLesson || syncedNext) return;
    previewId = nextLesson.id;
    syncedNext = true;
  });

  function aimLesson(lesson: Lesson): void {
    previewId = lesson.id;
  }

  function onRailKeydown(event: KeyboardEvent, flat: Lesson[]): void {
    const index = flat.findIndex((lesson) => lesson.id === previewId);
    if (index < 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = flat[index + 1];
      if (next) aimLesson(next);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = flat[index - 1];
      if (prev) aimLesson(prev);
    }
  }
</script>

<!-- Mobile -->
<div class="hidden max-[900px]:block">
  {#if previewLesson && previewTrack}
    <section class="border-b border-slate-200 pb-6">
      <Eyebrow>{previewTrack.title}</Eyebrow>
      <h1 class="m-0 mt-1 font-serif text-[1.75rem] font-semibold tracking-tight">
        {previewLesson.title}
      </h1>

      {#if previewPhrase}
        <p
          class="m-0 mt-4 font-serif text-[1.35rem] font-semibold leading-snug tracking-tight text-slate-900"
          lang="sk"
        >
          {previewPhrase.slovak}
        </p>
        {#if previewPhrase.english}
          <p class="m-0 mt-1 text-sm text-slate-500">{previewPhrase.english}</p>
        {/if}
      {/if}

      <div class="mt-5">
        <Button href={lessonPath(previewLesson)} class="w-full px-6">
          {openLabel}
          <ArrowRight />
        </Button>
      </div>
    </section>
  {/if}

  {#if hydrated && doneTotal > 0}
    <p class="m-0 mt-6 text-xs text-slate-500" data-lessons-done-summary>
      <span data-lessons-done-count>{doneTotal}</span> of {lessons.length} done
    </p>
  {:else}
    <p class="m-0 mt-6 hidden text-xs text-slate-500" data-lessons-done-summary>
      <span data-lessons-done-count>0</span> of {lessons.length} done
    </p>
  {/if}

  <nav class="mt-6 space-y-8" aria-label="Lessons">
    {#each trackGroups as group (group.track.id)}
      <div>
        <h2
          class="m-0 border-b border-slate-200 pb-2 text-base font-semibold text-slate-800"
        >
          {group.track.title}
        </h2>

        <ul class="m-0 list-none p-0">
          {#each group.lessons as lesson (lesson.id)}
            {@const completed = hydrated && doneIds.has(lesson.id)}

            <li>
              <a
                class="flex items-baseline justify-between gap-3 border-b border-slate-200 py-3.5 no-underline"
                href={lessonPath(lesson)}
              >
                <span
                  class="min-w-0 font-serif text-base text-blue-800"
                  data-lesson-title-completed={lesson.id}
                >
                  {lesson.title}
                </span>
                <span
                  class="hidden shrink-0 text-xs text-slate-400"
                  data-lesson-done={lesson.id}
                >
                  Done
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}

    <div class="space-y-3 border-t border-slate-200 pt-5">
      <TextLink href="/practice" class="flex items-center gap-1.5">
        Practice
        <ArrowRight />
      </TextLink>
      <TextLink href="/grammar" class="flex items-center gap-1.5">
        Grammar
        <ArrowRight />
      </TextLink>
    </div>
  </nav>
</div>

<!-- Desktop -->
<div class="grid grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] gap-10 max-[900px]:hidden">
  <aside
    class="sticky top-[calc(var(--header-height)+1.25rem)] flex max-h-[calc(100vh-var(--header-height)-2.5rem)] flex-col self-start"
  >
    <div class="shrink-0 border-b border-slate-200 pb-4">
      <div class="flex items-baseline justify-between gap-3">
        <h1 class="m-0 font-serif text-xl font-semibold tracking-tight text-slate-900">
          Lessons
        </h1>
        {#if hydrated}
          <p class="m-0 text-xs text-slate-500">
            {doneTotal} of {lessons.length}
          </p>
        {:else}
          <p class="m-0 hidden text-xs text-slate-500" data-lessons-done-summary>
            <span data-lessons-done-count>0</span> of {lessons.length}
          </p>
        {/if}
      </div>
    </div>

    <nav
      class="min-h-0 flex-1 space-y-7 overflow-y-auto py-4 scrollbar-thin"
      aria-label="Lessons"
    >
      {#each trackGroups as group (group.track.id)}
        <div>
          <p class="m-0 mb-2 px-1 text-sm font-medium text-slate-600">
            {group.track.title}
          </p>

          <ul class="m-0 list-none p-0">
            {#each group.lessons as lesson (lesson.id)}
              {@const completed = hydrated && doneIds.has(lesson.id)}
              {@const aimed = previewLesson?.id === lesson.id}

              <li>
                <a
                  class="block border-l-2 py-2 pl-3 no-underline transition-colors {aimed
                    ? 'border-blue-800 text-blue-900'
                    : 'border-transparent text-slate-700 hover:text-blue-800'}"
                  href={lessonPath(lesson)}
                  aria-current={aimed ? "true" : undefined}
                  onclick={(event) => {
                    event.preventDefault();
                    aimLesson(lesson);
                  }}
                  onkeydown={(event) => onRailKeydown(event, lessons)}
                >
                  <span
                    class="font-serif text-[0.95rem] leading-snug {completed && !aimed
                      ? 'text-slate-500'
                      : ''}"
                  >
                    {lesson.title}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </nav>

    <div class="shrink-0 space-y-2 border-t border-slate-200 pt-4">
      <TextLink href="/practice" class="flex items-center gap-1.5 text-sm">
        Practice
        <ArrowRight />
      </TextLink>
      <TextLink href="/grammar" class="flex items-center gap-1.5 text-sm">
        Grammar
        <ArrowRight />
      </TextLink>
    </div>
  </aside>

  <section class="min-w-0" aria-live="polite">
    {#if previewLesson && previewTrack}
      <Eyebrow>{previewTrack.title}</Eyebrow>

      <h1
        class="m-0 mt-1 max-w-[28ch] font-serif text-[clamp(1.85rem,3.2vw,2.5rem)] font-semibold leading-[1.15] tracking-tight text-slate-900"
      >
        {previewLesson.title}
      </h1>

      <Lead class="mt-4 max-w-[42ch]">
        {previewLesson.promise}
      </Lead>

      {#if previewPhrase}
        <div class="mt-8 border-y border-slate-200 py-8">
          <p
            class="m-0 font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-semibold leading-[1.2] tracking-tight text-slate-900"
            lang="sk"
          >
            {previewPhrase.slovak}
          </p>
          {#if previewPhrase.english}
            <p class="m-0 mt-3 text-base text-slate-500">
              {previewPhrase.english}
            </p>
          {/if}
        </div>
      {/if}

      {#if morePhrases.length || patternNote}
        <div class="mt-8 space-y-5">
          {#if morePhrases.length}
            <ul class="m-0 list-none space-y-2 p-0">
              {#each morePhrases as outcome (outcome.slovak)}
                <li class="font-serif text-[0.95rem] text-slate-800" lang="sk">
                  {outcome.slovak}
                  {#if outcome.english}
                    <span class="font-sans text-sm text-slate-500">
                      · {outcome.english}
                    </span>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}

          {#if patternNote}
            <p class="m-0 max-w-[40ch] text-sm leading-relaxed text-slate-600">
              {patternNote}
            </p>
          {/if}
        </div>
      {/if}

      <div class="mt-9">
        <Button href={lessonPath(previewLesson)} class="px-6">
          {openLabel}
          <ArrowRight />
        </Button>
      </div>

      {#if previewRefs.length || previewPractice}
        <div
          class="mt-10 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 max-[640px]:grid-cols-1"
        >
          {#if previewRefs.length}
            <div>
              <Eyebrow tone="muted">Reference</Eyebrow>
              <ul class="m-0 mt-2 list-none space-y-2 p-0">
                {#each previewRefs as link (link.href)}
                  <li>
                    <TextLink href={link.href} class="text-sm">{link.label}</TextLink>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if previewPractice}
            <div>
              <Eyebrow tone="muted">Practice</Eyebrow>
              <p class="m-0 mt-2">
                <TextLink href={`/practice/${previewPractice.id}`} class="text-sm">
                  {previewPractice.title}
                  <span class="text-slate-500">
                    · {practiceSessionCount(previewPractice)} exercises
                  </span>
                </TextLink>
              </p>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </section>
</div>
