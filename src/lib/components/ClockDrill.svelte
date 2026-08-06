<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import ClockIllustration from "$lib/components/ClockIllustration.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";

  import { gradeAnswer, suggestCloseAnswer } from "$lib/client/practice-state";
  import {
    analogFace,
    answersForTime,
    formatDigital,
    preferredAnswerForTime,
    randomDrillTime,
    type ClockFaceTime,
  } from "$lib/content/slovak-time";

  /** client:only island — randomize freely; never SSR'd. */
  let time = $state<ClockFaceTime>(randomDrillTime());
  let input = $state("");
  let submitted = $state(false);
  let revealed = $state(false);
  let showMore = $state(false);

  const face = $derived(analogFace(time));
  const digital = $derived(formatDigital(time));
  const accepted = $derived(answersForTime(time));
  const preferred = $derived(preferredAnswerForTime(time));
  const otherForms = $derived(accepted.filter((form) => form !== preferred));
  const grade = $derived(
    submitted && !revealed ? gradeAnswer(input, preferred, accepted) : null,
  );
  const closeSuggestion = $derived.by(() => {
    if (!submitted || revealed || grade !== "incorrect") return null;
    const suggestion = suggestCloseAnswer(input, preferred, accepted);
    if (!suggestion || suggestion === preferred) return null;
    return suggestion;
  });

  function nextTime(): void {
    time = randomDrillTime();
    input = "";
    submitted = false;
    revealed = false;
    showMore = false;
  }

  function check(): void {
    if (!input.trim()) return;
    submitted = true;
    revealed = false;
  }

  function reveal(): void {
    submitted = true;
    revealed = true;
    showMore = true;
  }
</script>

<section
  id="clock-drill"
  class="scroll-mt-[88px] bg-surface/90 p-7 max-[560px]:px-4 max-[560px]:py-5"
  aria-labelledby="clock-drill-heading"
>
  <Eyebrow>Practice</Eyebrow>
  <h2 id="clock-drill-heading" class="mb-2 font-serif text-2xl text-slate-900">
    Clock drill
  </h2>
  <p class="m-0 max-w-[66ch] font-serif text-slate-600">
    Read the face, then type how you would say the time. Short answers and formal minute
    readings both count.
  </p>

  <div class="mt-6 grid justify-items-center gap-3 py-6">
    <ClockIllustration hour={face.hour} minute={face.minute} size={160} label={digital} />
    <p class="m-0 font-serif text-lg font-semibold text-slate-900">{digital}</p>
    <p class="m-0 font-serif text-base text-blue-800" lang="sk">Koľko je hodín?</p>
  </div>

  <label class="mt-6 grid gap-2 text-xs font-bold text-slate-600">
    <span>Your Slovak answer</span>
    <input
      class="min-h-[50px] w-full border border-slate-300 bg-control px-3 py-2 font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      bind:value={input}
      disabled={submitted}
      autocomplete="off"
      autocapitalize="none"
      lang="sk"
      onkeydown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          check();
        }
      }}
    />
  </label>

  {#if submitted && (revealed || grade)}
    <div
      class={`mt-5 grid gap-1 border-l-4 p-4 ${
        revealed
          ? "border-blue-600 bg-blue-50"
          : grade === "incorrect"
            ? "border-rose-600 bg-rose-50"
            : "border-emerald-600 bg-emerald-50"
      }`}
      aria-live="polite"
    >
      {#if closeSuggestion}
        <p class="m-0 text-xs font-bold uppercase text-slate-600">Did you mean?</p>
        <strong class="mb-2 font-serif text-lg text-slate-900" lang="sk"
          >{closeSuggestion}</strong
        >
      {/if}

      <p class="m-0 text-xs font-bold uppercase text-slate-600">
        {#if revealed}
          One way to say it
        {:else if grade === "correct"}
          That works.
        {:else if grade === "accents"}
          Almost — check the accents.
        {:else}
          Try this.
        {/if}
      </p>

      <strong class="font-serif text-lg text-slate-900" lang="sk">{preferred}</strong>

      {#if otherForms.length > 0 && (revealed || grade !== "correct")}
        {#if !revealed}
          <button
            class="mt-2 justify-self-start text-left text-xs font-bold text-blue-800 underline underline-offset-2"
            type="button"
            onclick={() => (showMore = !showMore)}
          >
            {showMore ? "Hide other accepted forms" : "Also accepted"}
          </button>
        {:else}
          <p class="m-0 mt-3 text-xs font-bold uppercase text-slate-600">Also accepted</p>
        {/if}

        {#if showMore || revealed}
          <ul class="m-0 mt-2 grid list-none gap-1 p-0" lang="sk">
            {#each otherForms as form (form)}
              <li class="font-serif text-sm text-slate-700">{form}</li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>
  {/if}

  <div class="mt-6 flex flex-wrap gap-3">
    {#if !submitted}
      <Button type="button" onclick={check} disabled={!input.trim()}>Check</Button>
      <Button type="button" variant="secondary" onclick={reveal}>Reveal</Button>
      <Button type="button" variant="secondary" onclick={nextTime}>Skip</Button>
    {:else}
      <Button type="button" onclick={nextTime}>Next time</Button>
    {/if}
  </div>
</section>
