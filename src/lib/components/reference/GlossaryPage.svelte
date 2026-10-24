<script lang="ts">
  import { moreLinkClass } from "$lib/components/ui/system-ui";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import {
    dataColumnHeadClass,
    dataPanelClass,
    dataPanelHeadClass,
    dataRangeClass,
    dataStaticRowClass,
  } from "$lib/components/ui/data-list-ui";

  type Part = { text: string; sk?: boolean };

  interface Term {
    id: string;
    term: string;
    parts: Part[];
    href: string;
    link: string;
  }

  const terms: Term[] = [
    {
      id: "case",
      term: "Case",
      parts: [
        {
          text: "A word's job in a sentence, shown by its form. Slovak has six active cases.",
        },
      ],
      href: "/grammar/cases-overview",
      link: "Cases",
    },
    {
      id: "nominative",
      term: "Nominative",
      parts: [
        {
          text: "The subject case: who or what performs the action. Also the usual dictionary form for nouns and adjectives (the lemma), such as ",
        },
        { text: "Peter", sk: true },
        { text: " in " },
        { text: "Peter číta knihu", sk: true },
        { text: "." },
      ],
      href: "/grammar/cases/nominative",
      link: "Nominative",
    },
    {
      id: "declension",
      term: "Declension",
      parts: [
        {
          text: "The set of ending changes used by nouns, adjectives, pronouns, and numerals for case, number, and gender.",
        },
      ],
      href: "/grammar/cases-overview",
      link: "Cases",
    },
    {
      id: "conjugation",
      term: "Conjugation",
      parts: [
        {
          text: "The set of verb-form changes for person, number, tense, mood, and sometimes gender.",
        },
      ],
      href: "/grammar/present-tense",
      link: "Present tense",
    },
    {
      id: "tense",
      term: "Tense",
      parts: [
        {
          text: "The time of an action: present, past, or future. Tense is one part of conjugation.",
        },
      ],
      href: "/grammar/past-tense",
      link: "Past tense",
    },
    {
      id: "gender",
      term: "Gender",
      parts: [
        {
          text: "A noun class: masculine, feminine, or neuter. Gender affects related word endings.",
        },
      ],
      href: "/grammar/grammatical-gender",
      link: "Grammatical gender",
    },
    {
      id: "agreement",
      term: "Agreement",
      parts: [
        {
          text: "When related words take matching forms, such as an adjective matching a noun's gender, number, and case.",
        },
      ],
      href: "/grammar/grammatical-gender",
      link: "Grammatical gender",
    },
    {
      id: "lemma",
      term: "Lemma",
      parts: [
        {
          text: "The dictionary headword for a word: the citation form you look up. For verbs that is the infinitive (",
        },
        { text: "robiť", sk: true },
        { text: "); for nouns, nominative singular (" },
        { text: "stôl", sk: true },
        { text: "); for adjectives, masculine nominative singular (" },
        { text: "dobrý", sk: true },
        { text: ")." },
      ],
      href: "/dictionary",
      link: "Dictionary",
    },
    {
      id: "infinitive",
      term: "Infinitive",
      parts: [
        { text: "The dictionary form of a verb: its unconjugated base form, such as " },
        { text: "rozumieť", sk: true },
        { text: ", “to understand.” For verbs, the infinitive is the lemma." },
      ],
      href: "/grammar/present-tense",
      link: "Verb forms",
    },
    {
      id: "aspect",
      term: "Aspect",
      parts: [
        {
          text: "Whether a verb presents an action as ongoing or completed. Slovak aspect is separate from tense: the same past time can be imperfective (process) or perfective (finished).",
        },
      ],
      href: "/grammar/aspect",
      link: "Aspect",
    },
    {
      id: "imperfective",
      term: "Imperfective",
      parts: [
        {
          text: "The aspect for process, habit, or an unbounded activity — what was going on, not that it finished. Dictionary glosses mark these verbs with (imperfective).",
        },
      ],
      href: "/grammar/aspect#imperfective",
      link: "Aspect",
    },
    {
      id: "perfective",
      term: "Perfective",
      parts: [
        {
          text: "The aspect for a completed, bounded, or result-focused event. Dictionary glosses mark these verbs with (perfective).",
        },
      ],
      href: "/grammar/aspect#perfective",
      link: "Aspect",
    },
    {
      id: "mood",
      term: "Mood",
      parts: [
        {
          text: "How the speaker presents an action: as a fact (indicative), a command (imperative), or something imagined or polite (conditional).",
        },
      ],
      href: "/grammar/conditional",
      link: "Conditional",
    },
    {
      id: "imperative",
      term: "Imperative",
      parts: [
        { text: "The verb form for commands and requests, such as " },
        { text: "Píš!", sk: true },
        { text: " or " },
        { text: "Zavolajte mi.", sk: true },
      ],
      href: "/grammar/imperative",
      link: "Imperative",
    },
    {
      id: "conditional",
      term: "Conditional",
      parts: [
        { text: "The “would” form: the -l form plus " },
        { text: "by", sk: true },
        { text: ", as in " },
        { text: "Chcel by som kávu", sk: true },
        { text: "." },
      ],
      href: "/grammar/conditional",
      link: "Conditional",
    },
    {
      id: "reflexive",
      term: "Reflexive verb",
      parts: [
        { text: "A verb used with " },
        { text: "sa", sk: true },
        { text: " or " },
        { text: "si", sk: true },
        { text: ", such as " },
        { text: "volať sa", sk: true },
        { text: " (to be called) or " },
        { text: "dať si", sk: true },
        { text: " (to have, for yourself)." },
      ],
      href: "/grammar/reflexive-verbs",
      link: "Sa and si",
    },
  ];

  const track = "gap-x-6 gap-y-1 grid-cols-1 sm:grid-cols-[9rem_minmax(0,1fr)_auto]";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <header class="max-w-[640px]">
      <h1>Glossary</h1>
      <Lead>Short definitions for the grammar terms used across this site.</Lead>
    </header>

    <section class="{dataPanelClass} mt-10" aria-label="Glossary terms">
      <div class={dataPanelHeadClass}>
        <p class={dataRangeClass}>
          <strong class="font-semibold tabular-nums text-slate-900"
            >{terms.length} terms</strong
          >
          <span class="text-slate-600">A to Z of the grammar vocabulary</span>
        </p>
      </div>

      <div class="{dataColumnHeadClass} {track}" aria-hidden="true">
        <span>Term</span>
        <span>Meaning</span>
        <span>Read more</span>
      </div>

      <dl class="m-0">
        {#each terms as item (item.id)}
          <div id={item.id} class="{dataStaticRowClass} {track} scroll-mt-[88px] py-3">
            <dt class="font-serif text-base font-semibold leading-snug text-slate-900">
              {item.term}
            </dt>

            <dd class="m-0 min-w-0 text-sm leading-relaxed text-pretty text-slate-600">
              {#each item.parts as part, index (index)}
                {#if part.sk}
                  <span class="font-serif text-slate-900" lang="sk">{part.text}</span>
                {:else}
                  {part.text}
                {/if}
              {/each}
            </dd>

            <dd class="m-0">
              <a class="{moreLinkClass} whitespace-nowrap" href={item.href}>
                {item.link}
                <ArrowRight />
              </a>
            </dd>
          </div>
        {/each}
      </dl>
    </section>
  </PageShell>
</main>
