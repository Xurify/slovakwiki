<script lang="ts">
  import type { Snippet } from "svelte";

  import { episodeMinutes, type ListeningEpisode } from "$lib/catalog/listening";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  let {
    data,
    player,
  }: {
    data: { episode: ListeningEpisode };
    /** Client island: words, the chapter player and the chapter list. */
    player: Snippet;
  } = $props();

  const episode = $derived(data.episode);
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[720px]">
    <nav class="mb-4 flex flex-wrap gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/listening">Listening</TextLink>
      <span aria-hidden="true">/</span>
      <span>Episode {episode.number}</span>
    </nav>

    <header>
      <h1 class="m-0 text-[1.85rem] leading-tight sm:text-[2.15rem]" lang="sk">
        {episode.titleSk}
      </h1>

      <p class="m-0 mt-1 text-lg text-slate-500">{episode.title}</p>

      <Lead class="mt-3 text-pretty">{episode.promise}</Lead>

      <dl class="m-0 mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div class="flex gap-2">
          <dt class="text-slate-500">Length</dt>
          <dd class="m-0 font-semibold text-slate-800">{episodeMinutes(episode)} min</dd>
        </div>

        <div class="flex gap-2">
          <dt class="text-slate-500">Level</dt>
          <dd class="m-0 font-semibold text-slate-800">{episode.level}</dd>
        </div>

        <div class="flex gap-2">
          <dt class="text-slate-500">Grammar</dt>
          <dd class="m-0 font-semibold">
            <TextLink href="/grammar/{episode.grammarSlug}" lang="sk">
              {episode.topic}
            </TextLink>
          </dd>
        </div>
      </dl>
    </header>

    <div class="mt-8">
      {@render player()}
    </div>
  </PageShell>
</main>
