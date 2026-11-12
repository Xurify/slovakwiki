<script lang="ts">
  import {
    episodeCoverSrc,
    episodeMinutes,
    episodePath,
    listeningEpisodes,
  } from "$lib/catalog/listening";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { panelClass, panelHoverClass, tagClass } from "$lib/components/ui/system-ui";
  import { cx } from "$lib/ui/classes";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1040px]">
    <header class="max-w-xl">
      <h1 class="text-balance">Listening</h1>

      <Lead class="text-pretty">
        Short stories in simple Slovak, acted out on a small stage. Listen first, answer
        a few questions, then read along.
      </Lead>
    </header>

    <ol
      class="m-0 mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Episodes"
    >
      {#each listeningEpisodes as episode, index (episode.id)}
        <li class="flex">
          <a
            class={cx(
              panelClass,
              panelHoverClass,
              "group flex w-full flex-col overflow-hidden no-underline",
            )}
            href={episodePath(episode)}
          >
            <img
              src={episodeCoverSrc(episode)}
              alt=""
              width="960"
              height="480"
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              class="aspect-[2/1] w-full border-b border-slate-900/10 bg-subtle object-cover"
            />

            <span class="flex flex-1 flex-col px-4 pt-3.5 pb-4">
              <span class="flex items-baseline gap-2.5">
                <span class="font-serif text-lg leading-snug text-slate-400 tabular-nums">
                  <span class="sr-only">Episode</span>
                  {episode.number}
                </span>

                <strong
                  class="font-serif text-lg leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline"
                  lang="sk"
                >
                  {episode.titleSk}
                </strong>
              </span>

              <span class="mt-1.5 mb-4 text-sm leading-snug text-pretty text-slate-600">
                {episode.promise}
              </span>

              <span
                class="mt-auto flex items-center gap-3 border-t border-slate-200 pt-3"
              >
                {#if episode.topic}
                  <span class={tagClass}>
                    {episode.topic}
                  </span>
                {/if}

                <span class="ml-auto text-sm text-slate-500 tabular-nums">
                  {episodeMinutes(episode)} min
                </span>
              </span>
            </span>
          </a>
        </li>
      {/each}
    </ol>
  </PageShell>
</main>
