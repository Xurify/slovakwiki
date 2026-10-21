<script lang="ts">
  import { episodeMinutes, episodePath, listeningEpisodes } from "$lib/catalog/listening";
  import LessonMotif from "$lib/components/lessons/LessonMotif.svelte";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { panelClass, panelHoverClass } from "$lib/components/ui/system-ui";
  import { lessonMotifId } from "$lib/lesson-story/lesson-motifs";
  import { cx } from "$lib/ui/classes";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[720px]">
    <header class="max-w-xl">
      <h1 class="text-balance">Listening</h1>

      <Lead class="text-pretty">
        Short conversations in simple Slovak. Listen first, answer a few questions, then
        read along.
      </Lead>
    </header>

    <ol class="m-0 mt-10 grid list-none gap-3 p-0" aria-label="Episodes">
      {#each listeningEpisodes as episode (episode.id)}
        <li>
          <a
            class={cx(
              panelClass,
              panelHoverClass,
              "group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3.5 px-3 py-3 no-underline",
            )}
            href={episodePath(episode)}
          >
            <LessonMotif motif={lessonMotifId(episode.lessonId ?? "")} />

            <span class="min-w-0">
              <strong
                class="block font-serif text-base leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline sm:text-lg"
                lang="sk"
              >
                {episode.titleSk}
              </strong>

              <span class="mt-0.5 block text-sm leading-snug text-pretty text-slate-600">
                {episode.promise}
              </span>

              <span class="mt-1 block text-xs text-slate-500">
                <span lang="sk">{episode.topic}</span>
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                {episodeMinutes(episode)} min
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                {episode.level}
              </span>
            </span>

            <ArrowRight class="text-slate-400" />
          </a>
        </li>
      {/each}
    </ol>
  </PageShell>
</main>
