<script lang="ts">
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { GrammarTopic } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    topic,
    step,
  }: {
    topic: GrammarTopic;
    step: number;
  } = $props();

  const railClass = "absolute left-[1.125rem] w-0.5 -translate-x-1/2 bg-slate-200";

  const nodeClass = cx(
    "relative z-10 flex size-9 items-center justify-center self-center rounded-full border-2",
    "border-slate-300 bg-surface font-serif text-sm font-semibold tabular-nums text-slate-500",
  );

  const cardClass = cx(
    "group grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3.5 rounded-(--frame-radius)",
    "bg-surface/80 px-3 py-3 no-underline shadow-(--shadow-border)",
    "transition-[background-color,box-shadow] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)",
    "max-[480px]:grid-cols-1",
  );

  const exampleCount = $derived(topic.examples.length);
</script>

<li class="group/step relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3.5">
  <span class="{railClass} top-0 h-1/2 group-first/step:hidden" aria-hidden="true"></span>

  <span class="{railClass} top-1/2 -bottom-3 group-last/step:hidden" aria-hidden="true"
  ></span>

  <span class={nodeClass} aria-hidden="true">{step}</span>

  <a class={cardClass} href="/grammar/{topic.slug}">
    <span
      class="relative isolate block size-14 shrink-0 overflow-hidden rounded-(--control-radius) ring-1 ring-slate-900/10 ring-inset max-[480px]:hidden"
      aria-hidden="true"
    >
      <img
        src={motifArtSrc(grammarMotifId(topic.slug))}
        alt=""
        width="512"
        height="512"
        loading="lazy"
        decoding="async"
        class="size-full rounded-[inherit] object-cover transition-transform duration-300 ease-out group-hover:scale-105"
      />
    </span>

    <span class="min-w-0">
      <span class="flex flex-wrap items-baseline gap-x-2.5">
        <strong
          class="font-serif text-base leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline sm:text-lg"
        >
          {sentenceCase(topic.english)}
        </strong>

        <span class="font-serif text-sm text-slate-500" lang="sk">{topic.slovak}</span>
      </span>

      <span
        class="mt-0.5 line-clamp-2 block text-sm leading-snug text-pretty text-slate-500"
      >
        {topic.summary}
      </span>

      <span class="mt-1.5 block text-xs text-slate-500 tabular-nums">
        {exampleCount}
        {exampleCount === 1 ? "example" : "examples"}
        {#if topic.lessonLink}
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          has a lesson
        {/if}
      </span>
    </span>
  </a>
</li>
