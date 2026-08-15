<script lang="ts">
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import type { KeyPhrase } from "$lib/learning/types";

  let {
    audioSrcs = {},
    mountPrefix,
    phrases,
  }: {
    audioSrcs?: Record<string, string>;
    /** When set, render SSR placeholders for AudioMountHost instead of live buttons. */
    mountPrefix?: string;
    phrases: KeyPhrase[];
  } = $props();

  const lead = $derived(phrases[0]);
  const rest = $derived(phrases.slice(1));
  const watermark = $derived(lead?.slovak.replace(/[^\p{L}]/gu, "").slice(0, 1) ?? "");
</script>

{#if lead}
  {@const leadText = lead.audio?.transcript ?? lead.slovak}
  {@const leadSrc = audioSrcs[lead.slovak] ?? lead.audio?.src}

  <div aria-label="Key phrases">
    <article
      class="relative isolate overflow-hidden rounded-(--frame-radius) bg-panel-inverse px-6 py-7 max-[560px]:px-5 max-[560px]:py-6"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,color-mix(in_srgb,var(--accent)_30%,transparent),transparent_55%),radial-gradient(ellipse_at_95%_85%,color-mix(in_srgb,var(--panel-inverse-ink)_8%,transparent),transparent_50%)]"
        aria-hidden="true"
      ></div>

      {#if watermark}
        <span
          class="pointer-events-none absolute -bottom-8 -right-2 select-none font-serif text-[min(48vw,14rem)] leading-none text-panel-inverse-ink/[0.045]"
          aria-hidden="true"
          lang="sk"
        >
          {watermark}
        </span>
      {/if}

      <div class="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <p
          class="m-0 max-w-[18ch] font-serif text-[clamp(2rem,5.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-panel-inverse-ink text-pretty"
          lang="sk"
        >
          {lead.slovak}
        </p>

        {#if mountPrefix}
          <span
            class="inline-grid size-10 shrink-0 place-items-center"
            data-audio-mount={`${mountPrefix}-0`}
          ></span>
        {:else}
          <AudioButton
            size="md"
            variant="inverse"
            src={leadSrc}
            text={leadText}
            label={`Listen: ${lead.slovak}`}
          />
        {/if}
      </div>

      <p
        class="relative m-0 mt-4 max-w-[40ch] font-serif text-[1.1rem] leading-snug text-panel-inverse-ink/75"
      >
        {lead.english}
      </p>

      {#if lead.note}
        <p
          class="relative m-0 mt-5 max-w-[48ch] border-l-2 border-panel-inverse-ink/25 pl-3.5 text-sm leading-5 text-panel-inverse-ink/60"
        >
          {lead.note}
        </p>
      {/if}
    </article>

    {#if rest.length > 0}
      <ol
        class="mt-4 m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-3 p-0"
        start="2"
      >
        {#each rest as phrase, index (phrase.slovak)}
          {@const text = phrase.audio?.transcript ?? phrase.slovak}
          {@const src = audioSrcs[phrase.slovak] ?? phrase.audio?.src}
          {@const mountIndex = index + 1}

          <li
            class="flex min-h-[7.5rem] flex-col gap-1.5 rounded-(--control-radius) border border-slate-200 bg-surface px-4 py-4 shadow-(--shadow-border)"
          >
            <div class="flex items-start justify-between gap-2.5">
              <p
                class="m-0 min-w-0 font-serif text-[1.2rem] font-semibold leading-snug tracking-tight text-slate-900 text-pretty"
                lang="sk"
              >
                {phrase.slovak}
              </p>

              {#if mountPrefix}
                <span
                  class="inline-grid size-7 shrink-0 place-items-center"
                  data-audio-mount={`${mountPrefix}-${mountIndex}`}
                ></span>
              {:else}
                <AudioButton size="sm" {src} {text} label={`Listen: ${phrase.slovak}`} />
              {/if}
            </div>

            <p class="m-0 text-sm leading-5 text-slate-500">{phrase.english}</p>

            {#if phrase.note}
              <p class="m-0 mt-auto pt-2 text-xs leading-4 text-slate-500">
                {phrase.note}
              </p>
            {/if}
          </li>
        {/each}
      </ol>
    {/if}
  </div>
{/if}
