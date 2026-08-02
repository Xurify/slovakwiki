<script lang="ts">
  import { onMount } from "svelte";
  import { addReviewItem, emptyPracticeState, markLessonComplete, readPracticeState, writePracticeState } from "$lib/client/practice-state";
  import { lessonTracks } from "$lib/content/lessons";
  import KeyPhraseList from "$lib/components/lessons/KeyPhraseList.svelte";
  import LessonInteraction from "$lib/components/lessons/LessonInteraction.svelte";
  import LessonScene from "$lib/components/lessons/LessonScene.svelte";
  import PatternNote from "$lib/components/lessons/PatternNote.svelte";

  let { data } = $props();
  let activeIndex = $state(0); let finished = $state(false); let practiceState = $state(emptyPracticeState()); let hydrated = $state(false);
  const trackTitle = $derived(lessonTracks.find((track) => track.id === data.lesson.track)?.title ?? data.lesson.track);
  const currentExercise = $derived(data.lesson.exercises[activeIndex]);
  onMount(() => { practiceState = readPracticeState(localStorage); hydrated = true; });
  function persist(nextState: typeof practiceState): void { practiceState = nextState; if (hydrated) writePracticeState(localStorage, nextState); }
  function resolveExercise(result: { needsReview: boolean; practiceItemId?: string }): void { if (result.needsReview && result.practiceItemId) persist(addReviewItem(practiceState, result.practiceItemId)); if (activeIndex === data.lesson.exercises.length - 1) { persist(markLessonComplete(practiceState, data.lesson.id)); finished = true; return; } activeIndex += 1; }
</script>

<main class="px-[30px] py-12 pb-[78px] max-[640px]:px-3.5 max-[640px]:py-8 max-[640px]:pb-[50px]"><article class="mx-auto w-full max-w-[790px]"><nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><a class="text-blue-800 underline underline-offset-2" href="/lessons">Lessons</a><span>/</span><a class="text-blue-800 underline underline-offset-2" href="/lessons/{data.lesson.track}">{trackTitle}</a></nav>
  <header class="border-b border-slate-200 py-6 pb-8"><p class="section-label">{trackTitle}</p><h1>{data.lesson.title}</h1><p class="lead">{data.lesson.promise}</p></header>
  <section class="scroll-mt-[72px] pt-8" aria-labelledby="scene-heading"><p class="section-label">Start with the scene</p><h2 id="scene-heading" class="mb-4 text-2xl">Read it once</h2><LessonScene scene={data.lesson.scene} /></section>
  <section class="scroll-mt-[72px] mt-7 pt-8" aria-labelledby="phrases-heading"><p class="section-label">Keep these close</p><h2 id="phrases-heading" class="mb-4 text-2xl">Key phrases</h2><KeyPhraseList phrases={data.lesson.keyPhrases} /></section>
  {#if data.lesson.pattern}<section class="scroll-mt-[72px] mt-7 border-t border-slate-200 pt-8"><PatternNote pattern={data.lesson.pattern} /></section>{/if}
  <section class="scroll-mt-[72px] mt-10 border-t border-slate-200 pt-8" aria-labelledby="practice-heading"><p class="section-label">Practice in context</p><h2 id="practice-heading" class="mb-4 text-2xl">Use the scene</h2>{#if !hydrated}<p class="font-serif text-slate-500">Loading your lesson…</p>{:else if finished}<div class="border-l-4 border-emerald-600 bg-emerald-50 p-6"><p class="m-0 text-xs font-semibold uppercase tracking-widest text-emerald-700">Lesson complete</p><h3 class="mb-1 mt-2 font-serif text-2xl text-slate-900">Keep the scene, not a score.</h3><span class="font-serif text-slate-700">Anything you missed or revealed is ready in Review.</span><div class="mt-5 flex flex-wrap items-center gap-4"><a class="button min-h-10" href="/practice/review">Open Review</a><a class="text-link" href="/lessons">Browse lessons</a></div></div>{:else}<p class="m-0 mb-2 text-xs text-slate-500">Step {activeIndex + 1} of {data.lesson.exercises.length}</p>{#key currentExercise.id}<LessonInteraction exercise={currentExercise} onresolve={resolveExercise} />{/key}{/if}</section>
  <footer class="mt-10 border-t border-slate-200 pt-7"><p class="section-label">Go deeper</p><h2 class="mb-3 text-2xl">Reference</h2><div class="flex flex-wrap gap-2">{#each data.lesson.referenceLinks as link (link.href)}<a class="border border-slate-200 px-2.5 py-2 font-serif text-sm text-blue-800 hover:border-blue-600 hover:bg-blue-50" href={link.href}>{link.label} <span aria-hidden="true">→</span></a>{/each}</div></footer>
</article></main>
