<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  const rowClass =
    "scroll-mt-24 grid grid-cols-1 gap-x-8 gap-y-1 border-b border-slate-200 py-3.5 sm:grid-cols-[11rem_minmax(0,1fr)]";
</script>

{#snippet term(
  name: string,
  href: string,
  link: string,
  id: string | undefined,
  body: Snippet,
)}
  <div class={rowClass} {id}>
    <dt class="font-serif text-lg leading-snug font-semibold text-slate-900">{name}</dt>

    <dd class="m-0">
      <p class="m-0 text-[0.95rem] leading-relaxed text-slate-600">
        {@render body()}
      </p>

      <TextLink class="mt-1.5 inline-flex items-center gap-1.5" {href}>
        {link}
        <ArrowRight />
      </TextLink>
    </dd>
  </div>
{/snippet}

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[800px]">
    <header>
      <h1 class="m-0 text-[1.85rem] leading-tight sm:text-[2.15rem]">Glossary</h1>
      <Lead>Short definitions for the grammar words used on this site.</Lead>
    </header>

    <dl class="mt-8 border-t border-slate-200">
      {@render term("Case", "/grammar/cases-overview", "Open cases", undefined, caseBody)}
      {@render term(
        "Nominative",
        "/grammar/cases/nominative",
        "Open nominative",
        undefined,
        nominativeBody,
      )}
      {@render term(
        "Declension",
        "/grammar/cases-overview",
        "See declension",
        undefined,
        declensionBody,
      )}
      {@render term(
        "Conjugation",
        "/grammar/present-tense",
        "Open present tense",
        undefined,
        conjugationBody,
      )}
      {@render term(
        "Tense",
        "/grammar/present-tense",
        "Open present tense",
        undefined,
        tenseBody,
      )}
      {@render term(
        "Gender",
        "/grammar/grammatical-gender",
        "Open grammatical gender",
        undefined,
        genderBody,
      )}
      {@render term(
        "Agreement",
        "/grammar/grammatical-gender",
        "See agreement",
        undefined,
        agreementBody,
      )}
      {@render term("Lemma", "/dictionary", "Open dictionary", undefined, lemmaBody)}
      {@render term(
        "Infinitive",
        "/grammar/present-tense",
        "See verb forms",
        undefined,
        infinitiveBody,
      )}
      {@render term("Aspect", "/grammar/aspect", "Open aspect", "aspect", aspectBody)}
      {@render term(
        "Imperfective",
        "/grammar/aspect#imperfective",
        "See imperfective",
        "imperfective",
        imperfectiveBody,
      )}
      {@render term(
        "Perfective",
        "/grammar/aspect#perfective",
        "See perfective",
        "perfective",
        perfectiveBody,
      )}
    </dl>
  </PageShell>
</main>

{#snippet caseBody()}
  A word's job in a sentence, shown by its form. Slovak has six active cases.
{/snippet}

{#snippet nominativeBody()}
  The subject case: who or what performs the action. Also the usual dictionary form for
  nouns and adjectives (the lemma), such as <span lang="sk">Peter</span> in
  <span lang="sk">Peter číta knihu</span>.
{/snippet}

{#snippet declensionBody()}
  The set of ending changes used by nouns, adjectives, pronouns, and numerals for case,
  number, and gender.
{/snippet}

{#snippet conjugationBody()}
  The set of verb-form changes for person, number, tense, mood, and sometimes gender.
{/snippet}

{#snippet tenseBody()}
  The time of an action: present, past, or future. Tense is one part of conjugation.
{/snippet}

{#snippet genderBody()}
  A noun class: masculine, feminine, or neuter. Gender affects related word endings.
{/snippet}

{#snippet agreementBody()}
  When related words take matching forms, such as an adjective matching a noun's gender,
  number, and case.
{/snippet}

{#snippet lemmaBody()}
  The dictionary headword for a word: the citation form you look up. For verbs that is the
  infinitive (<span lang="sk">robiť</span>); for nouns, nominative singular (<span
    lang="sk">stôl</span
  >); for adjectives, masculine nominative singular (<span lang="sk">dobrý</span>).
{/snippet}

{#snippet infinitiveBody()}
  The dictionary form of a verb: its unconjugated base form, such as rozumieť, “to
  understand.” For verbs, the infinitive is the lemma.
{/snippet}

{#snippet aspectBody()}
  Whether a verb presents an action as ongoing or completed. Slovak aspect is separate
  from tense: the same past time can be imperfective (process) or perfective (finished).
{/snippet}

{#snippet imperfectiveBody()}
  The aspect for process, habit, or an unbounded activity — what was going on, not that it
  finished. Dictionary glosses mark these verbs with (imperfective).
{/snippet}

{#snippet perfectiveBody()}
  The aspect for a completed, bounded, or result-focused event. Dictionary glosses mark
  these verbs with (perfective).
{/snippet}
