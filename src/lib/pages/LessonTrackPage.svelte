<script lang="ts">
  import { cx, lead, page, sectionLabel, shell } from "$lib/ui/classes";

  import { lessonPath } from "$lib/content/lessons";
  let { data } = $props();
</script>

<main class={cx(shell, page, "max-w-[900px]", "pt-12")}>
  <nav class="mb-7 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><a class="text-blue-800 underline underline-offset-2" href="/lessons">Lessons</a><span aria-hidden="true">/</span><span>{data.track.title}</span></nav>
  <header class="max-w-[670px] border-b border-slate-200 py-7"><p class={sectionLabel}>Lesson track</p><h1>{data.track.title}</h1><p class={lead}>{data.track.description}</p></header>
  <section aria-labelledby="lesson-list-heading"><h2 id="lesson-list-heading" class="sr-only">Lessons</h2><ol class="m-0 list-none p-0">{#each data.lessons as lesson, index (lesson.id)}<li class="border-b border-slate-200"><a class="grid grid-cols-[50px_minmax(0,1fr)_auto] items-center gap-4 px-3 py-5 hover:bg-slate-50" href={lessonPath(lesson)}><span class="text-xs font-bold text-blue-700">{String(index + 1).padStart(2, "0")}</span><div class="grid gap-1">{#if lesson.group}<small class="text-xs font-bold uppercase tracking-wide text-slate-500">{lesson.group}</small>{/if}<strong class="font-serif text-xl text-blue-800">{lesson.title}</strong><p class="m-0 max-w-[56ch] font-serif leading-6 text-slate-700">{lesson.promise}</p></div><b class="text-lg text-blue-800" aria-hidden="true">→</b></a></li>{/each}</ol></section>
</main>
