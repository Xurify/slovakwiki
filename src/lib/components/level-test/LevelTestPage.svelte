<script lang="ts">
  import type { Snippet } from "svelte";

  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { eyebrowMutedClass, tagClass } from "$lib/components/ui/system-ui";
  import { SECTION_LABEL } from "$lib/level-test/plan";
  import { TASK_INFO, TASK_ORDER, type TaskScoring } from "$lib/level-test/task-info";
  import type { TestSection } from "$lib/level-test/types";

  import { plannedTagClass } from "./level-test-ui";

  let { start }: { start: Snippet } = $props();

  const SECTIONS: TestSection[] = [
    "adaptive",
    "reading",
    "listening",
    "writing",
    "speaking",
  ];

  const SCORING_TAG: Record<TaskScoring, string> = {
    adaptive: "Adaptive",
    interactive: "Interactive",
    ai: "AI-scored",
    speech: "Speech recognition",
    planned: "Planned",
  };

  const tasksBySection = SECTIONS.map((section) => ({
    section,
    tasks: TASK_ORDER.filter((task) => TASK_INFO[task].section === section),
  }));
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-x-12">
      <header class="max-w-xl lg:col-start-1">
        <Eyebrow>Level test</Eyebrow>
        <h1 class="text-balance">Find your Slovak level</h1>

        <Lead class="text-pretty">
          An adaptive placement test. Every answer sets the difficulty of the next
          question, so a short test places you on the CEFR scale from A1 to C2.
        </Lead>
      </header>

      <aside
        class="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start"
        aria-label="Start the test"
      >
        {@render start()}
      </aside>

      <section class="min-w-0 lg:col-start-1" aria-labelledby="level-test-contents">
        <h2
          id="level-test-contents"
          class="m-0 font-serif text-2xl font-semibold text-slate-900"
        >
          What is in the test
        </h2>

        <div class="mt-6 grid gap-8">
          {#each tasksBySection as group (group.section)}
            <div class="grid gap-3">
              <h3 class={eyebrowMutedClass}>{SECTION_LABEL[group.section]}</h3>

              <ul class="m-0 grid list-none gap-0 p-0">
                {#each group.tasks as task (task)}
                  {@const info = TASK_INFO[task]}
                  <li
                    class="grid gap-1 border-b border-slate-200 py-3 sm:grid-cols-[13rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4"
                  >
                    <p class="m-0 font-semibold text-slate-900">{info.label}</p>
                    <p class="m-0 text-sm text-slate-600">{info.description}</p>
                    <span
                      class="justify-self-start {info.scoring === 'planned'
                        ? plannedTagClass
                        : tagClass}"
                    >
                      {SCORING_TAG[info.scoring]}
                    </span>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      </section>

      <section class="min-w-0 lg:col-start-1" aria-labelledby="level-test-method">
        <h2
          id="level-test-method"
          class="m-0 font-serif text-2xl font-semibold text-slate-900"
        >
          How the score works
        </h2>

        <ol class="mt-5 grid gap-4 pl-5 text-slate-700">
          <li>
            Every question has a difficulty on a 0–100 scale, where A1 sits at 0 and C2 at
            100. It is predicted from how common the words are in Slovak (the Slovak
            National Corpus and film subtitles), how long the sentence is, and the level a
            text was written for.
          </li>
          <li>
            After each answer the test re-estimates your level with an item response model
            and picks the next question close to it, so you see fewer questions that are
            far too easy or far too hard.
          </li>
          <li>
            Writing and speaking are scored by AI on content, organisation, grammar and
            vocabulary, mapped onto the same scale.
          </li>
        </ol>

        <p class="m-0 mt-5 text-sm text-slate-500">
          The result is an estimate for your own learning, not a certificate.
        </p>

        <p class="m-0 mt-3 text-xs text-slate-500">
          Methodology inspired by the open research behind the
          <a
            class="text-slate-600 underline underline-offset-2 hover:text-slate-900"
            href="https://transacl.org/ojs/index.php/tacl/article/view/2070"
            target="_blank"
            rel="noopener noreferrer">Duolingo English Test (Settles et al., 2020)</a
          >.
        </p>
      </section>
    </div>
  </PageShell>
</main>
