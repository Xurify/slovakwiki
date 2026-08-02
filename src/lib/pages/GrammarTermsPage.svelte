<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  const termRowClass =
    "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-slate-200 py-5 max-[620px]:grid-cols-1";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/grammar">Grammar</TextLink>
      <span aria-hidden="true">/</span>
      <span>Language terms</span>
    </nav>

    <header class="max-w-[640px]">
      <Eyebrow>Grammar reference</Eyebrow>
      <h1>Language terms</h1>
      <Lead>Short definitions for the terms used in this reference.</Lead>
    </header>

    <dl class="mt-12 border-t border-slate-200">
      <div class={termRowClass}>
        <div>
          <dt class="font-serif text-lg font-semibold text-blue-800">Case</dt>
          <dd class="m-0 mt-1 font-serif leading-relaxed text-slate-600">
            A word's job in a sentence, shown by its form. Slovak has six active cases.
          </dd>
        </div>
        <TextLink class="inline-flex items-center gap-1.5" href="/grammar/cases-overview">
          Open cases <ArrowRight />
        </TextLink>
      </div>

      <div class={termRowClass}>
        <div>
          <dt class="font-serif text-lg font-semibold text-blue-800">Declension</dt>
          <dd class="m-0 mt-1 font-serif leading-relaxed text-slate-600">
            The set of ending changes used by nouns, adjectives, pronouns, and numerals
            for case, number, and gender.
          </dd>
        </div>
        <TextLink class="inline-flex items-center gap-1.5" href="/grammar/cases-overview">
          See declension <ArrowRight />
        </TextLink>
      </div>

      <div class={termRowClass}>
        <div>
          <dt class="font-serif text-lg font-semibold text-blue-800">Conjugation</dt>
          <dd class="m-0 mt-1 font-serif leading-relaxed text-slate-600">
            The set of verb-form changes for person, number, tense, mood, and sometimes
            gender.
          </dd>
        </div>
        <TextLink class="inline-flex items-center gap-1.5" href="/grammar/present-tense">
          Open present tense <ArrowRight />
        </TextLink>
      </div>

      <div class={termRowClass}>
        <div>
          <dt class="font-serif text-lg font-semibold text-blue-800">Tense</dt>
          <dd class="m-0 mt-1 font-serif leading-relaxed text-slate-600">
            The time of an action: present, past, or future. Tense is one part of
            conjugation.
          </dd>
        </div>
        <TextLink class="inline-flex items-center gap-1.5" href="/grammar/present-tense">
          Open present tense <ArrowRight />
        </TextLink>
      </div>

      <div class={termRowClass}>
        <div>
          <dt class="font-serif text-lg font-semibold text-blue-800">Gender</dt>
          <dd class="m-0 mt-1 font-serif leading-relaxed text-slate-600">
            A noun class: masculine, feminine, or neuter. Gender affects related word
            endings.
          </dd>
        </div>
        <TextLink
          class="inline-flex items-center gap-1.5"
          href="/grammar/grammatical-gender"
        >
          Open grammatical gender <ArrowRight />
        </TextLink>
      </div>

      <div class={termRowClass}>
        <div>
          <dt class="font-serif text-lg font-semibold text-blue-800">Agreement</dt>
          <dd class="m-0 mt-1 font-serif leading-relaxed text-slate-600">
            When related words take matching forms, such as an adjective matching a noun's
            gender, number, and case.
          </dd>
        </div>
        <TextLink
          class="inline-flex items-center gap-1.5"
          href="/grammar/grammatical-gender"
        >
          See agreement <ArrowRight />
        </TextLink>
      </div>

      <div class={termRowClass}>
        <div>
          <dt class="font-serif text-lg font-semibold text-blue-800">Infinitive</dt>
          <dd class="m-0 mt-1 font-serif leading-relaxed text-slate-600">
            The dictionary form of a verb: its unconjugated base form, such as rozumieť,
            “to understand.”
          </dd>
        </div>
        <TextLink class="inline-flex items-center gap-1.5" href="/grammar/present-tense">
          See verb forms <ArrowRight />
        </TextLink>
      </div>

      <div class={termRowClass}>
        <div>
          <dt class="font-serif text-lg font-semibold text-blue-800">Aspect</dt>
          <dd class="m-0 mt-1 font-serif leading-relaxed text-slate-600">
            Whether a verb presents an action as completed or ongoing. This reference will
            cover it separately.
          </dd>
        </div>
      </div>
    </dl>
  </PageShell>
</main>
