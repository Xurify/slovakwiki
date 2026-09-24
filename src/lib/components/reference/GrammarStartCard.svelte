<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";

  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { GrammarTopic } from "$lib/catalog/types";

  let {
    topic,
    areaAnchor,
    areaTopicCount,
  }: {
    topic: GrammarTopic;
    areaAnchor: string;
    areaTopicCount: number;
  } = $props();

  const example = $derived(topic.examples[0]);
</script>

<article
  class="overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
  aria-labelledby="grammar-start-heading"
>
  <div class="relative h-36 overflow-hidden border-b border-slate-200/70">
    <img
      src={motifArtSrc(grammarMotifId(topic.slug))}
      alt=""
      width="512"
      height="512"
      decoding="async"
      class="absolute inset-0 size-full object-cover"
    />
  </div>

  {#if example}
    <div class="border-b border-slate-200/70 px-5 pt-4 pb-4 text-center">
      <p
        class="m-0 font-serif text-lg leading-snug font-semibold tracking-tight text-balance text-slate-900"
        lang="sk"
      >
        {example.slovak}
      </p>

      <p class="m-0 mt-1 text-sm leading-snug text-pretty text-slate-600">
        {example.english}
      </p>
    </div>
  {/if}

  <div class="flex flex-col px-5 pt-5 pb-5">
    <p class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
      Start here
      <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
      <a
        class="text-inherit no-underline hover:text-blue-800 hover:underline"
        href="#{areaAnchor}"
      >
        {topic.pathGroup}
      </a>
    </p>

    <h2
      id="grammar-start-heading"
      class="m-0 mt-2 font-serif text-xl leading-snug tracking-tight text-balance text-slate-900"
    >
      {sentenceCase(topic.english)}
    </h2>

    <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
      {topic.summary}
    </p>

    <p class="m-0 mt-4 text-xs leading-relaxed text-pretty text-slate-500">
      Topic 1 of {areaTopicCount}
      <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
      {topic.examples.length}
      {topic.examples.length === 1 ? "example" : "examples"}
    </p>

    <div class="mt-5 flex flex-col gap-3">
      <Button href="/grammar/{topic.slug}" variant="accent" class="w-full px-4">
        Read the topic
        <ArrowRight />
      </Button>

      <a
        class="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline"
        href="/glossary"
      >
        New to the terms? Glossary
        <ArrowRight />
      </a>
    </div>
  </div>
</article>
