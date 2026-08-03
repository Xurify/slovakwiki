<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { lessonPath, lessonTracks, lessonsForTrack } from "$lib/content/lessons";

  const rowLinkClass =
    "group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-start gap-4 border-b border-slate-200 -mx-4 px-4 py-6 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_50%,transparent)] max-[640px]:grid-cols-[2.5rem_minmax(0,1fr)_auto]";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <header class="max-w-[640px]">
      <Eyebrow>Lessons</Eyebrow>
      <h1>Learn Slovak in context</h1>
      <Lead>
        Short, focused scenes that help you understand a pattern, then use it yourself.
      </Lead>
    </header>

    <div class="mt-12" aria-label="Lessons by track">
      {#each lessonTracks as track (track.id)}
        {@const trackLessons = lessonsForTrack(track.id)}
        <section class="mt-10 first:mt-0" aria-labelledby={`track-${track.id}`}>
          <div class="border-b border-slate-200 pb-4">
            <h2 id={`track-${track.id}`} class="font-serif text-2xl text-blue-800">
              {track.title}
            </h2>
            <p class="m-0 mt-1 font-serif text-sm leading-relaxed text-slate-600">
              {track.description}
            </p>
          </div>

          <ol class="m-0 list-none p-0">
            {#each trackLessons as lesson, index (lesson.id)}
              <li>
                <a class={rowLinkClass} href={lessonPath(lesson)}>
                  <span
                    class="pt-1 font-sans text-xs font-bold tabular-nums text-slate-400"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div class="grid gap-1">
                    {#if lesson.group}
                      <small
                        class="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-slate-500"
                      >
                        {lesson.group}
                      </small>
                    {/if}
                    <strong class="font-serif text-xl text-blue-800">
                      {lesson.title}
                    </strong>
                    <p class="m-0 font-serif text-sm leading-relaxed text-slate-600">
                      {lesson.promise}
                    </p>
                  </div>
                  <ArrowRight class="mt-1 text-blue-800" />
                </a>
              </li>
            {/each}
          </ol>
        </section>
      {/each}
    </div>
  </PageShell>
</main>
