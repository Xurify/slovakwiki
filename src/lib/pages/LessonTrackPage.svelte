<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import LessonLevelBlock from "$lib/components/lessons/LessonLevelBlock.svelte";
  import { lessonPath } from "$lib/content/lessons";
  import { displayLevels, nextLessonInList } from "$lib/lessons/progress";

  let { data } = $props();

  const levels = $derived(displayLevels(data.lessons));
  const focusLesson = $derived(nextLessonInList(new Set(), data.lessons));
</script>

<main class="py-12 pb-20 max-[600px]:py-8" data-lessons-track={data.track.id}>
  <PageShell class="max-w-[720px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/lessons">Lessons</TextLink>
      <span aria-hidden="true">/</span>
      <span>{data.track.title}</span>
    </nav>

    <header>
      <h1 class="text-balance">{data.track.title}</h1>
      <Lead class="text-pretty">{data.track.description}</Lead>
    </header>

    <div class="mt-8" data-lessons-hydrate>
      <p class="m-0 text-xs tabular-nums text-slate-500">
        <span data-track-progress-pct>0</span>% complete
      </p>

      <span class="mt-2 block h-1 overflow-hidden rounded-full bg-slate-200">
        <span
          class="block h-full rounded-full bg-blue-600"
          data-track-progress-bar={data.track.id}
          style:width="0%"
        ></span>
      </span>

      {#if focusLesson}
        <div class="mt-5">
          <Button
            href={lessonPath(focusLesson)}
            variant="accent"
            class="px-6 max-[600px]:w-full"
            data-track-continue-cta
          >
            <span data-track-continue-cta-label>Continue learning</span>
            <ArrowRight />
          </Button>
        </div>
      {/if}
    </div>

    <div class="mt-10 space-y-10" data-lessons-hydrate>
      {#each levels as level, levelIndex (level.key)}
        <LessonLevelBlock
          {level}
          number={levelIndex + 1}
          showHeader={levels.length > 1}
          startIndex={levels
            .slice(0, levelIndex)
            .reduce((sum, entry) => sum + entry.lessons.length, 0)}
          statusFor={(_lesson, index) =>
            levelIndex === 0 && index === 0 ? "active" : "upcoming"}
        />
      {/each}
    </div>
  </PageShell>
</main>
