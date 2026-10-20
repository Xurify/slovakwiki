<script lang="ts">
  import { episodeMinutes, episodePath, listeningEpisodes } from "$lib/catalog/listening";
  import LessonMotif from "$lib/components/lessons/LessonMotif.svelte";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { panelClass, panelHoverClass } from "$lib/components/ui/system-ui";
  import { lessonMotifId } from "$lib/lesson-story/lesson-motifs";

  const cardClass = `${panelClass} ${panelHoverClass} group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3.5 px-3 py-3 no-underline`;
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[720px]">
    <header class="max-w-xl">
      <h1 class="text-balance">Listening</h1>

      <Lead class="text-pretty">
        Short podcast episodes in simple Slovak, one grammar topic at a time. Listen
        first, answer a few questions about what you heard, then read the transcript line
        by line.
      </Lead>
    </header>

    <ol class="m-0 mt-10 grid list-none gap-3 p-0" aria-label="Episodes">
      {#each listeningEpisodes as episode (episode.id)}
        <li>
          <a class={cardClass} href={episodePath(episode)}>
            <LessonMotif motif={lessonMotifId(episode.lessonId ?? "")} />

            <span class="min-w-0">
              <strong
                class="block font-serif text-base leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline sm:text-lg"
              >
                {episode.title}
                <span class="font-normal text-slate-500" lang="sk">
                  · {episode.titleSk}</span
                >
              </strong>

              <span class="mt-0.5 block text-sm leading-snug text-pretty text-slate-500">
                Episode {episode.number}
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                {episode.level}
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                about {episodeMinutes(episode)} min
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                with {episode.hosts.map((host) => host.speaker).join(", ")}
              </span>

              <span class="mt-1 block text-sm leading-snug text-pretty text-slate-600">
                {episode.promise}
              </span>
            </span>

            <ArrowRight class="text-slate-400" />
          </a>
        </li>
      {/each}
    </ol>

    <p class="m-0 mt-8 max-w-[62ch] text-sm leading-relaxed text-slate-600">
      Every episode is spoken by the same voices as the lessons, and links back to its
      grammar page, lesson and practice set.
    </p>
  </PageShell>
</main>
