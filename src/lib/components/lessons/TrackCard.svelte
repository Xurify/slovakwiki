<script lang="ts">
  import type { KeyPhrase, LessonTrack } from "$lib/content/learning-types";

  let { lessonCount, preview, track }: { lessonCount: number; preview?: KeyPhrase; track: LessonTrack } = $props();
</script>

<a class="group flex min-h-[304px] flex-col overflow-hidden rounded-(--frame-radius) bg-white p-6 shadow-(--shadow-border) hover:-translate-y-0.5 hover:shadow-(--shadow-border-hover)" href="/lessons/{track.id}">
  <p class="m-0 text-xs font-semibold uppercase tracking-widest text-slate-500">Lesson track</p>
  <h2 class="mb-1.5 mt-2 min-h-10 font-serif text-3xl font-semibold tracking-tight text-slate-900">{track.title}</h2>
  <p class="m-0 min-h-[4.5rem] max-w-[29ch] font-serif leading-6 text-pretty text-slate-600">{track.description}</p>
  {#if preview}
    <div class="mt-6 grid min-h-[4.5rem] gap-0.5 border-t border-slate-200 pt-4">
      <strong class="font-serif text-lg text-slate-900" lang="sk">{preview.slovak}</strong>
      <small class="text-xs text-slate-500">{preview.english}</small>
    </div>
  {/if}
  <footer class="mt-auto flex items-center justify-between gap-4 pt-6 text-xs text-slate-500">
    <small>{lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</small>
    <strong class="text-sm text-slate-700">Browse <span aria-hidden="true">→</span></strong>
  </footer>
</a>
