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

      <Lead class="mt-2 text-pretty">{episode.promise}</Lead>

      <p class="m-0 mt-3 flex flex-wrap items-center gap-x-2 text-sm text-slate-600">
        <span>{episodeMinutes(episode)} min</span>
        <span aria-hidden="true">·</span>
        <span>{episode.level}</span>
        <span aria-hidden="true">·</span>
        <TextLink href="/grammar/{episode.grammarSlug}" lang="sk"
          >{episode.topic}</TextLink
        >
      </p>
    </header>

    <div class="mt-6">
      {@render player()}
    </div>
  </PageShell>
</main>
