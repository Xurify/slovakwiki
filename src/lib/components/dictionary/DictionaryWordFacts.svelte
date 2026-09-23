<script lang="ts">
  import { referenceCardClass } from "$lib/components/reference/reference-ui";

  import { partOfSpeechLabel } from "$lib/catalog/dictionary/part-of-speech";
  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
  import {
    DIALECT_CHIP_LABEL,
    REGISTER_CHIP_LABEL,
    type ContentEntry,
  } from "$lib/catalog/types";

  let { senses }: { senses: readonly ContentEntry[] } = $props();

  const ranked = $derived(senses.filter((sense) => sense.frequency));
  const register = $derived(senses.find((sense) => sense.register)?.register);
  const dialect = $derived(senses.some((sense) => sense.dialect === true));

  const rowClass = "grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 px-5 py-2.5";
  const termClass = "text-xs font-semibold text-slate-500";
  const valueClass = "m-0 text-sm text-slate-900";
</script>

<section class={referenceCardClass} aria-labelledby="entry-facts-heading">
  <h2
    id="entry-facts-heading"
    class="m-0 border-b border-slate-200/70 px-5 pt-4 pb-3 font-serif text-lg leading-snug tracking-tight text-slate-900"
  >
    At a glance
  </h2>

  <dl class="m-0 divide-y divide-slate-200/70">
    <div class={rowClass}>
      <dt class={termClass}>Part of speech</dt>
      <dd class={valueClass}>
        {senses.map((sense) => partOfSpeechLabel(sense.category)).join(" · ")}
      </dd>
    </div>

    {#if ranked.length}
      <div class={rowClass}>
        <dt class={termClass}>Frequency</dt>
        <dd class="m-0 grid gap-1">
          {#each ranked as sense (sense.slug)}
            {#if sense.frequency}
              <a
                class="text-sm font-semibold text-blue-800 tabular-nums no-underline hover:underline"
                href={`/dictionary/common/${sense.frequency.partOfSpeech}`}
              >
                #{sense.frequency.rank} among
                {FREQUENCY_PART_OF_SPEECH_LABEL[
                  sense.frequency.partOfSpeech
                ].toLocaleLowerCase("en")}
              </a>
            {/if}
          {/each}
        </dd>
      </div>
    {/if}

    {#if register}
      <div class={rowClass}>
        <dt class={termClass}>Register</dt>
        <dd class={valueClass}>{REGISTER_CHIP_LABEL[register]}</dd>
      </div>
    {/if}

    {#if dialect}
      <div class={rowClass}>
        <dt class={termClass}>Region</dt>
        <dd class={valueClass}>{DIALECT_CHIP_LABEL}</dd>
      </div>
    {/if}
  </dl>
</section>
