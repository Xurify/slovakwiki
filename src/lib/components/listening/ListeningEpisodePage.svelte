<script lang="ts">
  import type { Snippet } from "svelte";

  import {
    episodeCheckCount,
    episodeMinutes,
    type ListeningEpisode,
  } from "$lib/catalog/listening";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";

  let {
    data,
    player,
  }: {
    data: { episode: ListeningEpisode };
    /** Client island: vocabulary, chapters, questions and the transport bar. */
    player: Snippet;
  } = $props();

  const episode = $derived(data.episode);
  const minutes = $derived(episodeMinutes(episode));
  const checks = $derived(episodeCheckCount(episode));
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[720px]">
    <nav class="mb-4 flex flex-wrap gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/listening">Listening</TextLink>
      <span aria-hidden="true">/</span>
      <span>Episode {episode.number}</span>
    </nav>

    <header>
      <p class={eyebrowMutedClass}>
        Episode {episode.number}
        <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
        {episode.level}
        <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
        about {minutes} min of audio
        <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
        {checks} questions
      </p>

      <h1 class="m-0 mt-2 text-[1.85rem] leading-tight sm:text-[2.15rem]">
        {episode.title}
      </h1>

      <p class="m-0 mt-1 font-serif text-xl text-blue-800" lang="sk">{episode.titleSk}</p>

      <Lead class="text-pretty">{episode.promise}</Lead>

      <ul
        class="m-0 mt-5 flex list-none flex-wrap gap-x-6 gap-y-3 p-0"
        aria-label="Voices"
      >
        {#each episode.hosts as host (host.speaker)}
          <li class="flex items-center gap-2.5">
            <LessonCharacterAvatar speaker={host.speaker} size="md" />

            <span class="grid">
              <span class="text-sm font-semibold text-slate-900">{host.speaker}</span>
              <span class="text-xs text-slate-500">{host.role}</span>
            </span>
          </li>
        {/each}
      </ul>

      <p class="m-0 mt-5 max-w-[62ch] text-sm leading-relaxed text-slate-600">
        Play a chapter and just listen. Answer the questions from what you heard, then the
        transcript opens with every line ready to replay.
      </p>
    </header>

    <div class="mt-8">
      {@render player()}
    </div>
  </PageShell>
</main>
