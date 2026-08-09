<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import ClockIllustration from "./ClockIllustration.svelte";

  import { gradeAnswer, suggestCloseAnswer } from "$lib/client/practice-state";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import {
    feedbackPanelClass,
    feedbackToneFromGrade,
    shouldShowCorrection,
  } from "$lib/components/practice/practice-feedback-ui";
  import {
    analogFace,
    answersForTime,
    formatDigital,
    preferredAnswerForTime,
    randomDrillTime,
    type ClockFaceTime,
  } from "./clock";

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
  const showCorrection = $derived(shouldShowCorrection(submitted, grade, revealed));

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
  <h2 id="clock-drill-heading" class="mb-2 font-serif text-2xl text-slate-900">
    Clock drill
  </h2>

  <p class="m-0 max-w-[66ch] text-sm text-slate-600">
    Read the face, then type how you would say the time. Short answers and formal minute
    readings both count.
  </p>

  <div class="mt-6 grid justify-items-center gap-3 py-6">
    <ClockIllustration hour={face.hour} minute={face.minute} size={160} label={digital} />
    <p class="m-0 font-serif text-lg font-semibold text-slate-900">{digital}</p>
    <p class="m-0 font-serif text-base text-blue-800" lang="sk">Koľko je hodín?</p>
  </div>

  <label class="mt-6 grid gap-2 text-sm font-medium text-slate-600">
    <span>Your Slovak answer</span>
    <input
      class="min-h-[50px] w-full rounded-(--control-radius) border border-slate-300 bg-control px-3 py-2 font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
      class={`mt-5 ${feedbackPanelClass(feedbackToneFromGrade(grade, revealed))}`}
      aria-live="polite"
    >
      <PracticeExerciseFeedback
        {closeSuggestion}
        correction={preferred}
        grade={grade === "correct"
          ? "correct"
          : grade === "accents"
            ? "accents"
            : "incorrect"}
        revealed={revealed || grade === "incorrect"}
        {showCorrection}
        correctionLabelTone={grade === "correct" ? "emerald" : "rose"}
      />

      {#if otherForms.length > 0 && (revealed || grade !== "correct")}
        {#if !revealed}
          <button
            class="justify-self-start border-0 bg-transparent py-0 text-left text-sm font-semibold text-blue-800 underline underline-offset-2"
            type="button"
            onclick={() => (showMore = !showMore)}
          >
            {showMore ? "Hide other accepted forms" : "Also accepted"}
          </button>
        {:else}
          <p class="m-0 text-sm font-medium text-slate-600">Also accepted</p>
        {/if}

        {#if showMore || revealed}
          <ul class="m-0 grid list-none gap-1 p-0" lang="sk">
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
      <Button type="button" variant="accent" onclick={check} disabled={!input.trim()}
        >Check</Button
      >
      <Button type="button" variant="secondary" onclick={reveal}>Reveal</Button>
      <Button type="button" variant="secondary" onclick={nextTime}>Skip</Button>
    {:else}
      <Button type="button" onclick={nextTime}>Next time</Button>
    {/if}
  </div>
</section>
