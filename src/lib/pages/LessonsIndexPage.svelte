<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { lessonTracks, lessonsForTrack } from "$lib/content/lessons";

  const rowLinkClass =
    "group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-200 -mx-4 px-4 py-6 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_60%,transparent)]";
</script>

<main class="py-14 pb-20 max-[800px]:py-[30px] max-[800px]:pb-[50px]">
  <PageShell class="max-w-[900px] pt-14 max-[600px]:pt-8">
    <header class="max-w-[700px]">
      <Eyebrow>Lessons</Eyebrow>
      <h1>Learn Slovak in context</h1>
      <Lead>
        Short, focused scenes that help you understand a pattern, then use it yourself.
      </Lead>
    </header>

    <nav class="mt-12" aria-label="Lesson tracks">
      {#each lessonTracks as track (track.id)}
        {@const trackLessons = lessonsForTrack(track.id)}
        {@const preview = trackLessons[0]?.keyPhrases[0]}
        <a class={rowLinkClass} href="/lessons/{track.id}">
          <div class="grid gap-1.5">
            <strong class="font-serif text-2xl text-blue-800">{track.title}</strong>
            <p class="m-0 max-w-[52ch] font-serif text-sm leading-relaxed text-slate-600">
              {track.description}
            </p>
            {#if preview}
              <p class="m-0 text-sm text-slate-500">
                <span lang="sk" class="font-serif text-slate-800">{preview.slovak}</span>
                — {preview.english}
              </p>
            {/if}
          </div>
          <span class="inline-flex items-center gap-2 text-sm text-slate-500">
            {trackLessons.length}
            {trackLessons.length === 1 ? "lesson" : "lessons"}
            <ArrowRight class="text-blue-800" />
          </span>
        </a>
      {/each}
    </nav>
  </PageShell>
</main>
