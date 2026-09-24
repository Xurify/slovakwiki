<script lang="ts">
  import type { Snippet } from "svelte";

  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarHero from "$lib/components/reference/GrammarHero.svelte";
  import GrammarLeaderList from "$lib/components/reference/GrammarLeaderList.svelte";
  import GrammarLinkStrip, {
    type StripLink,
  } from "$lib/components/reference/GrammarLinkStrip.svelte";
  import GrammarPatternList from "$lib/components/reference/GrammarPatternList.svelte";
  import GrammarSection from "$lib/components/reference/GrammarSection.svelte";
  import GrammarTopicNeighbors from "$lib/components/reference/GrammarTopicNeighbors.svelte";
  import { grammarProseClass } from "$lib/components/reference/grammar-topic-ui";
  import { ClockGrid } from "$lib/learning/time";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { practiceItemHref } from "$lib/catalog/practice";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
  import {
    grammarGroupAnchor,
    grammarNeighbors,
    grammarTopicsInGroup,
  } from "$lib/catalog/reference/grammar-path";
  import { parsePattern } from "$lib/catalog/reference/grammar-pattern";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { EntryKind, GrammarTopic } from "$lib/catalog/types";

  interface RelatedEntry {
    english: string;
    href: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  type SectionKey =
    "pattern" | "rule" | "terms" | "clock" | "examples" | "mistake" | "more";

  let {
    topic,
    relatedEntries = [],
    audioKeys = [],
    clockDrill,
  }: {
    topic: GrammarTopic;
    relatedEntries?: RelatedEntry[];
    audioKeys?: string[];
    /** Client island slot from Astro (`client:only` / `client:load`). */
    clockDrill?: Snippet;
  } = $props();

  const isTime = $derived(topic.slug === "telling-time");
  const terms = $derived(topic.termSections ?? []);
  const neighbors = $derived(grammarNeighbors(topic.slug));
  const areaHref = $derived(`/grammar#${grammarGroupAnchor[topic.pathGroup]}`);

  const words = $derived(
    relatedEntries
      .filter((entry) => entry.kind === "word")
      .map((entry) => ({
        href: entry.href,
        primary: entry.slovak,
        secondary: entry.english.split(";")[0]!.trim(),
        slug: entry.slug,
      })),
  );

  const topics = $derived(
    relatedEntries
      .filter((entry) => entry.kind !== "word")
      .map((entry) => ({
        href: entry.href,
        primary: sentenceCase(entry.english),
        secondary: entry.slovak,
        slug: entry.slug,
      })),
  );

  /** Ending tiles already show one example each; skip the list so they are not repeated. */
  const examplesInPattern = $derived.by(() => {
    if (topic.caseOverview || isTime) return false;
    const view = parsePattern(topic.pattern.lines, topic.examples);
    return view.kind === "tiles" && view.tiles.every((tile) => tile.example);
  });

  const drills = $derived(
    topic.examples.flatMap((example) =>
      example.practiceItemId ? [practiceItemHref(example.practiceItemId)] : [],
    ),
  );

  const stripLinks = $derived.by(() => {
    const links: StripLink[] = [];

    if (topic.lessonLink) {
      links.push({
        eyebrow: "In a lesson",
        label: topic.lessonLink.label,
        href: topic.lessonLink.href,
      });
    } else {
      const count = grammarTopicsInGroup(topic.pathGroup).length;
      links.push({
        eyebrow: topic.pathGroup,
        label: `${count} topics in this area`,
        href: areaHref,
      });
    }

    if (drills[0]) {
      links.push({
        eyebrow: "Practice",
        label: drills.length === 1 ? "1 drill" : `${drills.length} drills`,
        href: drills[0],
      });
    }

    const step = neighbors.next ?? neighbors.previous;
    if (step) {
      links.push({
        eyebrow: neighbors.next ? "Next topic" : "Previous topic",
        label: sentenceCase(step.english),
        href: `/grammar/${step.slug}`,
        rel: neighbors.next ? "next" : "prev",
      });
    }

    return links;
  });

  const sections = $derived(
    (
      [
        "pattern",
        "rule",
        terms.length > 0 && "terms",
        isTime && "clock",
        topic.examples.length > 0 && !examplesInPattern && "examples",
        "mistake",
        "more",
      ] as const
    ).filter((key): key is SectionKey => key !== false),
  );

  function index(key: SectionKey): string {
    return String(sections.indexOf(key) + 1).padStart(2, "0");
  }
</script>

<main class="pb-24 max-[880px]:pb-16">
  <PageShell>
    <GrammarHero
      crumbs={[
        { href: "/grammar", label: "Grammar" },
        { href: areaHref, label: topic.pathGroup },
      ]}
      slovak={topic.slovak}
      english={sentenceCase(topic.english)}
      summary={topic.summary}
      art={motifArtSrc(grammarMotifId(topic.slug))}
    />

    <GrammarLinkStrip links={stripLinks} label="Use this topic" />

    {#if topic.caseOverview}
      <GrammarSection
        id="cases"
        index={index("pattern")}
        label="Cases"
        title="The six cases"
        intro="Learn the nominative first. Use the rest as a map of common roles, then open a case for its examples."
      >
        <GrammarCaseMap cases={topic.caseOverview} />
      </GrammarSection>
    {:else}
      <GrammarSection
        id="pattern"
        index={index("pattern")}
        label="Pattern"
        title={topic.pattern.label}
        intro={isTime
          ? "Rows marked next hour name the hour you are heading toward."
          : undefined}
      >
        <GrammarPatternList
          lines={topic.pattern.lines}
          examples={topic.examples}
          withClocks={isTime}
        />
      </GrammarSection>
    {/if}

    <GrammarSection id="rule" index={index("rule")} label="Rule" title="How it works">
      <div class="flex flex-col gap-4">
        {#each topic.rule as paragraph (paragraph)}
          <p class={grammarProseClass}>{paragraph}</p>
        {/each}
      </div>

      <div class="mt-9 max-w-[62ch] border-l-2 border-blue-200 pl-6">
        <Eyebrow tone="muted" compact>When you read</Eyebrow>

        <p class="m-0 font-serif text-[1.05rem] leading-relaxed text-slate-700 italic">
          {topic.lookFor}
        </p>
      </div>
    </GrammarSection>

    {#if terms.length > 0}
      <GrammarSection id="terms" index={index("terms")} label="Labels" title="Key labels">
        <dl class="m-0 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {#each terms as term (term.id)}
            <div
              id={term.id}
              class="scroll-mt-24 border-t border-slate-300 pt-3 target:border-blue-600"
            >
              <dt
                class="font-serif text-[1.15rem] font-semibold tracking-[-0.02em] text-slate-900"
              >
                {term.title}
              </dt>

              <dd
                class="m-0 mt-1.5 text-[0.9rem] leading-relaxed text-pretty text-slate-600"
              >
                {term.body}
              </dd>
            </div>
          {/each}
        </dl>
      </GrammarSection>
    {/if}

    {#if isTime}
      <GrammarSection
        id="clock-faces"
        index={index("clock")}
        label="Clock"
        title="See the time"
        intro="Match each face to the Slovak phrase. Quarters and halves name the hour ahead."
      >
        <ClockGrid />

        {#if clockDrill}
          <div class="mt-10">
            {@render clockDrill()}
          </div>
        {/if}
      </GrammarSection>
    {/if}

    {#if sections.includes("examples")}
      <GrammarSection
        id="examples"
        index={index("examples")}
        label="Sentences"
        title="In real sentences"
      >
        <GrammarExampleList examples={topic.examples} {audioKeys} />
      </GrammarSection>
    {/if}

    <GrammarSection
      id="watch-out"
      index={index("mistake")}
      label="Watch out"
      title="Common mistake"
    >
      <p
        class="m-0 max-w-[62ch] border-l-2 border-rose-300 pl-6 font-serif text-[1.2rem] leading-[1.6] text-pretty text-slate-900"
      >
        {topic.watchOut}
      </p>
    </GrammarSection>

    <GrammarSection
      id="more"
      index={index("more")}
      label="Keep going"
      title="Where to next"
    >
      {#if words.length > 0 || topics.length > 0}
        <div class="mb-12 grid gap-x-12 gap-y-9 sm:grid-cols-2">
          <GrammarLeaderList title="Words in this topic" links={words} primaryLang="sk" />
          <GrammarLeaderList title="Related topics" links={topics} primaryLang="en" />
        </div>
      {/if}

      <GrammarTopicNeighbors {neighbors} />

      <p class="m-0 mt-12 text-[0.82rem] text-slate-500">
        Source:
        <TextLink href={topic.source} rel="noopener noreferrer" target="_blank">
          Jazykovedný ústav Ľudovíta Štúra SAV ↗
        </TextLink>
        <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
        Full attribution on <TextLink href="/references">References</TextLink>.
      </p>
    </GrammarSection>
  </PageShell>
</main>
