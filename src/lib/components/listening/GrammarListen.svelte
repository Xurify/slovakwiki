<script lang="ts">
  import type { GrammarListen } from "$lib/catalog/listening/types";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { panelClass } from "$lib/components/ui/system-ui";

  import ListenStage from "./ListenStage.svelte";

  let {
    audioSrcs,
    episodeHref,
    listen,
  }: {
    audioSrcs: Record<string, string>;
    /** The longer podcast episode on the same topic, when there is one. */
    episodeHref?: string;
    listen: GrammarListen;
  } = $props();
</script>

{#snippet fullEpisode()}
  <TextLink href={episodeHref}>Hear the full episode</TextLink>
{/snippet}

<article class="{panelClass} overflow-hidden" aria-labelledby="{listen.id}-title">
  <header class="px-4 pt-4 sm:px-5">
    <h3
      id="{listen.id}-title"
      class="m-0 font-serif text-xl tracking-tight text-pretty text-slate-900"
    >
      <span lang="sk">{listen.titleSk}</span>
      <span class="font-normal text-slate-500"> · {listen.title}</span>
    </h3>
  </header>

  <ListenStage
    chapter={listen}
    {audioSrcs}
    actions={episodeHref ? fullEpisode : undefined}
  />
</article>
