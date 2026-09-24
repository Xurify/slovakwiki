<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";

  import {
    grammarCardClass,
    grammarEyebrowClass,
    grammarRowsClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { practiceItemHref } from "$lib/catalog/practice";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
  import {
    grammarGroupAnchor,
    grammarGroupPurpose,
  } from "$lib/catalog/reference/grammar-path";
  import type { GrammarTopic } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  interface RailLink {
    href: string;
    primary: string;
    secondary: string;
    slug: string;
  }

  let {
    topic,
    words,
    topics,
  }: {
    topic: GrammarTopic;
    words: RailLink[];
    topics: RailLink[];
  } = $props();

  const practiceHref = $derived(
    topic.examples
      .map(
        (example) => example.practiceItemId && practiceItemHref(example.practiceItemId),
      )
      .find((href) => href),
  );

  const linkRowClass =
    "group flex items-center justify-between gap-3 px-5 py-2.5 no-underline transition-colors hover:bg-slate-50";
</script>

<article class={grammarCardClass} aria-label="Topic at a glance">
  <div class="relative h-44 overflow-hidden border-b border-slate-200/70">
    <img
      src={motifArtSrc(grammarMotifId(topic.slug))}
      alt=""
      width="512"
      height="512"
      decoding="async"
      class="absolute inset-0 size-full object-cover"
    />
  </div>

  {#if topic.lessonLink}
    <div class="px-5 pt-5 pb-5">
      <p class={grammarEyebrowClass}>In a lesson</p>

      <h2
        class="m-0 mt-2 font-serif text-xl leading-snug tracking-tight text-balance text-slate-900"
      >
        {topic.lessonLink.label}
      </h2>

      <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
        See it used in a short scene, then try it yourself.
      </p>

      <Button href={topic.lessonLink.href} variant="accent" class="mt-5 w-full">
        Open the lesson
        <ArrowRight />
      </Button>

      {#if practiceHref}
        <a
          class="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline"
          href={practiceHref}
        >
          Or practice it
          <ArrowRight />
        </a>
      {/if}
    </div>
  {:else if practiceHref}
    <div class="px-5 pt-5 pb-5">
      <p class={grammarEyebrowClass}>Practice</p>

      <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
        Short drills that use these sentences.
      </p>

      <Button href={practiceHref} variant="accent" class="mt-4 w-full">
        Practice this
        <ArrowRight />
      </Button>
    </div>
  {:else}
    <div class="px-5 pt-5 pb-5">
      <p class={grammarEyebrowClass}>{topic.pathGroup}</p>

      <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
        {grammarGroupPurpose[topic.pathGroup]}
      </p>

      <a
        class="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline"
        href="/grammar#{grammarGroupAnchor[topic.pathGroup]}"
      >
        More in {topic.pathGroup.toLowerCase()}
        <ArrowRight />
      </a>
    </div>
  {/if}
</article>

{#each [{ title: "Words in this topic", links: words, sk: true }, { title: "Related topics", links: topics, sk: false }] as group (group.title)}
  {#if group.links.length > 0}
    <section class={grammarCardClass} aria-label={group.title}>
      <p class={cx(grammarEyebrowClass, "border-b border-slate-200/70 px-5 py-3")}>
        {group.title}
      </p>

      <ul class={grammarRowsClass}>
        {#each group.links as link (link.slug)}
          <li>
            <a class={linkRowClass} href={link.href}>
              <span class="min-w-0">
                <span
                  class="block font-serif text-[0.95rem] leading-snug text-slate-900 group-hover:text-blue-800"
                  lang={group.sk ? "sk" : undefined}
                >
                  {link.primary}
                </span>

                <span
                  class="block text-xs text-slate-500"
                  lang={group.sk ? undefined : "sk"}
                >
                  {link.secondary}
                </span>
              </span>

              <ArrowRight class="text-slate-400 group-hover:text-blue-800" />
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
{/each}
