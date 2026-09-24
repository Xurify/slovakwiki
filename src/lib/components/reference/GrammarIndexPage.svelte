<script lang="ts">
  import GrammarAreaSection from "$lib/components/reference/GrammarAreaSection.svelte";
  import GrammarQuestionsCard from "$lib/components/reference/GrammarQuestionsCard.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { grammarEntries } from "$lib/catalog/entries";
  import type { GrammarTopic } from "$lib/catalog/types";

  type GrammarGroup = GrammarTopic["pathGroup"];

  /** Reading order follows each topic's `nextSlug` chain. */
  const groups: GrammarGroup[] = ["Nouns", "Verbs", "Sentence building", "Numbers"];

  const groupPurpose: Record<GrammarGroup, string> = {
    Nouns: "Gender and cases — how nouns change in a sentence.",
    Verbs: "Present forms, byť / mať, and aspect pairs.",
    "Sentence building": "Word order, formality, negation, and questions.",
    Numbers: "Counting, quantity agreement, and clock time.",
  };

  const groupAnchor: Record<GrammarGroup, string> = {
    Nouns: "group-nouns",
    Verbs: "group-verbs",
    "Sentence building": "group-sentence-building",
    Numbers: "group-numbers",
  };

  const areas = groups.map((group) => ({
    group,
    topics: grammarEntries
      .filter((topic) => topic.pathGroup === group)
      .toSorted((first, second) => first.order - second.order),
  }));
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-x-12 lg:gap-y-12">
      <header class="max-w-xl lg:col-start-1">
        <h1 class="text-balance">Grammar</h1>

        <Lead class="text-pretty">
          Short explanations of the patterns you meet in the lessons, each with real
          sentences. Browse by area, or jump straight to what's confusing you.
        </Lead>
      </header>

      <aside
        class="flex flex-col gap-4 max-lg:order-last lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        aria-label="Quick answers"
      >
        <GrammarQuestionsCard />
      </aside>

      <div class="min-w-0 lg:col-start-1">
        <div class="space-y-14">
          {#each areas as area (area.group)}
            <GrammarAreaSection
              anchor={groupAnchor[area.group]}
              title={area.group}
              purpose={groupPurpose[area.group]}
              topics={area.topics}
            />
          {/each}
        </div>

        <p class="m-0 mt-14">
          <TextLink href="/practice">Go to practice</TextLink>
        </p>
      </div>
    </div>
  </PageShell>
</main>
