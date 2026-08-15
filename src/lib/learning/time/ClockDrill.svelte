<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import ClockIllustration from "./ClockIllustration.svelte";

  import {
    closestAcceptedAnswer,
    displayPracticeAnswer,
    gradeAnswer,
  } from "$lib/components/practice/practice-state";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import {
    feedbackPanelClass,
    feedbackToneFromGrade,
    shouldShowCorrection,
  } from "$lib/components/practice/practice-feedback-ui";
  import {
    analogFace,
    answersForTime,
    appointmentAnswersForTime,
    appointmentChoiceWhy,
    formatDigital,
    preferredAnswerForTime,
    preferredAppointmentAnswerForTime,
    randomDrillTime,
    tellingChoiceWhy,
    type ClockFaceTime,
  } from "./clock";

  type ClockRegister = "telling" | "appointment";

  /** client:only island — randomize freely; never SSR'd. */
  let time = $state<ClockFaceTime>(randomDrillTime());
  let register = $state<ClockRegister>("telling");
  let input = $state("");
  let submitted = $state(false);
  let revealed = $state(false);
  let showMore = $state(false);
  let answerInput = $state<HTMLInputElement | null>(null);

  const face = $derived(analogFace(time));
  const digital = $derived(formatDigital(time));
  const promptSk = $derived(register === "telling" ? "Koľko je hodín?" : "O koľkej?");
  const accepted = $derived(
    register === "telling" ? answersForTime(time) : appointmentAnswersForTime(time),
  );
  const preferred = $derived(
    register === "telling"
      ? preferredAnswerForTime(time)
      : preferredAppointmentAnswerForTime(time),
  );

  const correction = $derived(closestAcceptedAnswer(input, preferred, accepted));
  const otherForms = $derived(accepted.filter((form) => form !== correction));
  const grade = $derived(
    submitted && !revealed ? gradeAnswer(input, preferred, accepted) : null,
  );
  const showCorrection = $derived(shouldShowCorrection(submitted, grade, revealed));
  const wrongRegisterHint = $derived.by(() => {
    if (!submitted || revealed || grade === "correct" || grade === "accents") {
      return null;
    }
    const otherAccepted =
      register === "telling" ? appointmentAnswersForTime(time) : answersForTime(time);
    if (
      !otherAccepted.some((form) => gradeAnswer(input, form, otherAccepted) === "correct")
    ) {
      return null;
    }
    return register === "telling"
      ? "That form answers **O koľkej?** — this question needs **Je/Sú …**."
      : "That form answers **Koľko je hodín?** — this question needs **O …**.";
  });
  const registerWhy = $derived(
    register === "appointment" ? appointmentChoiceWhy(time) : tellingChoiceWhy(time),
  );
  const feedbackWhy = $derived.by(() => {
    if (!submitted || revealed || grade === "correct") return null;
    if (wrongRegisterHint) return `${wrongRegisterHint} ${registerWhy}`;
    if (grade === "incorrect" || grade === "accents") return registerWhy;
    return null;
  });

  function focusAnswerInput(): void {
    answerInput?.focus();
  }

  function clearAttempt(): void {
    input = "";
    submitted = false;
    revealed = false;
    showMore = false;
  }

  function setRegister(next: ClockRegister): void {
    if (next === register) return;
    register = next;
    clearAttempt();
  }

  function nextTime(): void {
    time = randomDrillTime();
    register = register === "telling" ? "appointment" : "telling";
    clearAttempt();
    focusAnswerInput();
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
    Answer the question under the clock. <span lang="sk">Je/Sú …</span> vs
    <span lang="sk">O …</span>.
  </p>

  <div
    class="mt-5 inline-flex rounded-(--control-radius) bg-slate-100 p-1"
    role="group"
    aria-label="Question register"
  >
    <button
      class="min-h-10 rounded-[calc(var(--control-radius)-2px)] px-3 text-sm font-semibold transition-colors {register ===
      'telling'
        ? 'bg-surface text-slate-900 shadow-(--shadow-border)'
        : 'text-slate-600 hover:text-slate-900'}"
      type="button"
      aria-pressed={register === "telling"}
      disabled={submitted}
      lang="sk"
      onclick={() => setRegister("telling")}
    >
      Koľko je hodín?
    </button>
    <button
      class="min-h-10 rounded-[calc(var(--control-radius)-2px)] px-3 text-sm font-semibold transition-colors {register ===
      'appointment'
        ? 'bg-surface text-slate-900 shadow-(--shadow-border)'
        : 'text-slate-600 hover:text-slate-900'}"
      type="button"
      aria-pressed={register === "appointment"}
      disabled={submitted}
      lang="sk"
      onclick={() => setRegister("appointment")}
    >
      O koľkej?
    </button>
  </div>

  <div class="mt-6 grid justify-items-center gap-3 py-6">
    <ClockIllustration hour={face.hour} minute={face.minute} size={192} label={digital} />
    <p class="m-0 font-serif text-lg font-semibold text-blue-800" lang="sk">{promptSk}</p>
    {#if submitted}
      <p class="m-0 font-serif text-lg font-semibold text-slate-900">{digital}</p>
    {/if}
  </div>

  <label class="mt-6 grid gap-2 text-sm font-medium text-slate-600">
    <span>Your Slovak answer</span>
    <input
      class="min-h-[50px] w-full rounded-(--control-radius) border border-slate-300 bg-control px-3 py-2 font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      bind:this={answerInput}
      bind:value={input}
      disabled={submitted}
      autocomplete="off"
      autocapitalize="none"
      lang="sk"
      onkeydown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (submitted) {
          nextTime();
          return;
        }
        check();
      }}
    />
  </label>

  {#if submitted && (revealed || grade)}
    <div
      class={`mt-5 ${feedbackPanelClass(feedbackToneFromGrade(grade, revealed))}`}
      aria-live="polite"
    >
      <PracticeExerciseFeedback
        {correction}
        grade={grade === "correct"
          ? "correct"
          : grade === "accents"
            ? "accents"
            : "incorrect"}
        revealed={revealed || grade === "incorrect"}
        {showCorrection}
        correctionLabelTone={grade === "correct" ? "emerald" : "rose"}
        why={feedbackWhy}
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
              <li class="font-serif text-sm text-slate-700">
                {displayPracticeAnswer(form)}
              </li>
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
      <Button type="button" onclick={nextTime}>Next</Button>
    {/if}
  </div>
</section>
