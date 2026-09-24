<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";

  import {
    grammarCardClass,
    grammarEyebrowClass,
    grammarRowsClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
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
    sections,
    words,
    topics,
  }: {
    topic: GrammarTopic;
    sections: { id: string; label: string }[];
    words: RailLink[];
    topics: RailLink[];
  } = $props();

  const linkRowClass =
    "group flex items-center justify-between gap-3 px-5 py-2.5 no-underline transition-colors hover:bg-slate-50";
</script>

<article class={cx(grammarCardClass, !topic.lessonLink && "max-lg:hidden")}>
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

  <nav class="py-2 max-lg:hidden" aria-label="On this page">
    <p class={cx(grammarEyebrowClass, "px-5 pt-2 pb-1")}>On this page</p>

    <ul class="m-0 list-none p-0">
      {#each sections as section (section.id)}
        <li>
          <a
            class="block px-5 py-1.5 text-sm text-slate-700 no-underline hover:bg-slate-50 hover:text-blue-800"
            href="#{section.id}"
          >
            {section.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  {#if topic.lessonLink}
    <div class="border-t border-slate-200/70 px-5 pt-4 pb-5">
      <p class={grammarEyebrowClass}>In a lesson</p>

      <p class="m-0 mt-1.5 text-sm leading-relaxed text-pretty text-slate-600">
        See it used in a short scene, then try it yourself.
      </p>

      <Button href={topic.lessonLink.href} variant="accent" class="mt-4 w-full">
        {topic.lessonLink.label}
        <ArrowRight />
      </Button>
    </div>
  {/if}
</article>

{#each [{ title: "Words to know", links: words, sk: true }, { title: "Related topics", links: topics, sk: false }] as group (group.title)}
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
