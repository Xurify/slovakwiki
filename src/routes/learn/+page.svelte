<script lang="ts">
  const lessonWords = [
    { slovak: "Ahoj!", english: "Hi!", note: "Informal hello and goodbye." },
    { slovak: "Dobrý deň.", english: "Good day.", note: "Safe, polite greeting." },
    {
      slovak: "Ako sa máš?",
      english: "How are you?",
      note: "Use with one person you know.",
    },
    {
      slovak: "Dobre, ďakujem.",
      english: "Well, thank you.",
      note: "A natural short reply.",
    },
    {
      slovak: "Prosím.",
      english: "Please / You’re welcome.",
      note: "One small word, several uses.",
    },
    { slovak: "Dovidenia.", english: "Goodbye.", note: "Polite farewell." },
  ];

  let currentStep = $state(0);
  let complete = $state(false);
  let completedThrough = $state(-1);

  let progressValue = $derived(complete ? lessonWords.length : currentStep + 1);
  let progressText = $derived(
    complete
      ? "Lesson complete"
      : `Phrase ${currentStep + 1} of ${lessonWords.length}`,
  );

  function handleNext(): void {
    completedThrough = Math.max(completedThrough, currentStep);
    if (currentStep < lessonWords.length - 1) {
      currentStep += 1;
    } else {
      complete = true;
    }
  }

  function selectStep(index: number): void {
    currentStep = index;
    complete = false;
  }

  function restartLesson(): void {
    currentStep = 0;
    completedThrough = -1;
    complete = false;
  }
</script>

<svelte:head>
  <title>Beginner Slovak Path | Slovak Atlas</title>
  <meta
    name="description"
    content="Start learning Slovak with a short first-contact lesson."
  >
</svelte:head>

<main class="shell page">
  <header class="lesson-head">
    <div>
      <p class="eyebrow">Beginner path · Lesson 1 of 4</p>
      <h1>Make first contact</h1>
      <p class="lead">
        Six phrases for greeting someone, responding, and leaving naturally.
      </p>
    </div>
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Lesson progress</span>
        <strong>{progressText}</strong>
      </div>
      <progress max={lessonWords.length} value={progressValue}>
        {progressValue} of {lessonWords.length}
      </progress>
    </div>
  </header>

  <div class="lesson-workspace">
    <nav class="lesson-nav" aria-label="Lesson phrases">
      <h2>Lesson outline</h2>
      <ol>
        {#each lessonWords as phrase, index (`${phrase.slovak}-${index}`)}
          {@const isCurrent = index === currentStep && !complete}
          {@const isDone = index <= completedThrough || complete}
          <li>
            <button
              class={isCurrent ? "current" : isDone ? "done" : ""}
              type="button"
              aria-current={isCurrent ? "step" : undefined}
              onclick={() => selectStep(index)}
            >
              <span class="step-marker" aria-hidden="true">{isDone ? "✓" : index + 1}</span>
              <span>
                <strong lang="sk">{phrase.slovak}</strong>
                <small>{isCurrent ? "Current phrase" : isDone ? "Completed" : "Not started"}</small>
              </span>
            </button>
          </li>
        {/each}
      </ol>
    </nav>

    <section class="lesson-stage" aria-live="polite" aria-atomic="true">
      {#if complete}
        <div class="complete">
          <p class="section-label">Lesson complete</p>
          <h2 lang="sk">Výborne!</h2>
          <p>You can now open and close a simple Slovak conversation.</p>
          <div class="actions">
            <a class="button" href="/quiz">Practice these words</a>
            <button class="button secondary" type="button" onclick={restartLesson}>
              Review lesson
            </button>
          </div>
        </div>
      {:else}
        <div class="stage-head">
          <span>Phrase {String(currentStep + 1).padStart(2, "0")}</span>
          <span>{lessonWords[currentStep].english}</span>
        </div>
        <div class="phrase">
          <p lang="sk">{lessonWords[currentStep].slovak}</p>
          <p>{lessonWords[currentStep].english}</p>
        </div>
        <div class="usage">
          <h2>Usage note</h2>
          <p>{lessonWords[currentStep].note}</p>
        </div>
        <div class="stage-actions">
          <span>{progressText}</span>
          <button class="button" type="button" onclick={handleNext}>
            {currentStep === lessonWords.length - 1 ? "Finish lesson" : "Next phrase"}
          </button>
        </div>
      {/if}
    </section>
  </div>
</main>

<style>
  .lesson-head {
    display: grid;
    grid-template-columns: 1fr 320px;
    align-items: end;
    gap: 52px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--line);
  }

  .lesson-head h1 {
    font-size: clamp(2rem, 4vw, 3rem);
  }

  .progress-wrap {
    display: grid;
    gap: 9px;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    color: var(--muted);
    font-size: 0.72rem;
  }

  .progress-label strong {
    color: var(--ink);
  }

  progress {
    width: 100%;
    height: 8px;
    border: 0;
    border-radius: 0;
    background: var(--line);
    color: var(--blue);
  }

  progress::-webkit-progress-bar {
    background: var(--line);
  }

  progress::-webkit-progress-value {
    background: var(--blue);
  }

  progress::-moz-progress-bar {
    background: var(--blue);
  }

  .lesson-workspace {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    align-items: start;
    gap: 20px;
    padding-top: 28px;
  }

  .lesson-nav,
  .lesson-stage {
    border: 1px solid var(--line);
    background: var(--surface);
  }

  .lesson-nav h2 {
    margin: 0;
    padding: 14px 15px;
    border-bottom: 3px solid var(--ink);
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .lesson-nav ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .lesson-nav button {
    display: grid;
    width: 100%;
    grid-template-columns: 28px 1fr;
    align-items: center;
    gap: 10px;
    min-height: 60px;
    padding: 9px 12px;
    border: 0;
    border-bottom: 1px solid var(--line);
    background: var(--surface);
    color: var(--muted);
    cursor: pointer;
    text-align: left;
  }

  .lesson-nav button:hover {
    background: var(--surface-subtle);
  }

  .lesson-nav button.current {
    box-shadow: inset 3px 0 var(--blue);
    background: var(--surface-selected);
    color: var(--ink);
  }

  .step-marker {
    display: grid;
    width: 24px;
    height: 24px;
    place-items: center;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    font-size: 0.68rem;
  }

  .done .step-marker {
    border-color: var(--green);
    color: var(--green);
  }

  .current .step-marker {
    border-color: var(--blue);
    background: var(--blue);
    color: white;
  }

  .lesson-nav button > span:last-child {
    display: grid;
    gap: 2px;
  }

  .lesson-nav strong {
    overflow: hidden;
    font-size: 0.8rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lesson-nav small {
    font-size: 0.66rem;
  }

  .lesson-stage {
    min-height: 430px;
    padding: 28px 32px;
  }

  .stage-head {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--line);
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .phrase {
    padding-block: 38px 34px;
  }

  .phrase p:first-child {
    margin: 0;
    color: var(--blue);
    font-size: clamp(2.4rem, 6vw, 4.5rem);
    font-weight: 750;
    letter-spacing: -0.04em;
    line-height: 1.08;
  }

  .phrase p:last-child {
    margin: 8px 0 0;
    color: var(--muted-strong);
    font-size: 1.08rem;
    font-weight: 600;
  }

  .usage {
    padding: 16px 18px;
    border-left: 3px solid var(--line-strong);
    background: var(--surface-subtle);
  }

  .usage h2 {
    margin: 0;
    color: var(--muted);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .usage p {
    margin: 5px 0 0;
  }

  .stage-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-top: 28px;
  }

  .stage-actions > span {
    color: var(--muted);
    font-size: 0.75rem;
  }

  .complete {
    display: grid;
    min-height: 370px;
    align-content: center;
    justify-items: start;
  }

  .complete h2 {
    color: var(--blue);
    font-size: clamp(2.6rem, 6vw, 4rem);
  }

  .complete > p:not(.section-label) {
    color: var(--muted);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;
  }

  @media (max-width: 800px) {
    .lesson-head,
    .lesson-workspace {
      grid-template-columns: 1fr;
    }

    .lesson-head {
      gap: 24px;
    }

    .lesson-nav ol {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }

    .lesson-nav li:nth-child(odd) {
      border-right: 1px solid var(--line);
    }
  }

  @media (max-width: 520px) {
    .lesson-nav ol {
      grid-template-columns: 1fr;
    }

    .lesson-nav li:nth-child(odd) {
      border-right: 0;
    }

    .lesson-stage {
      min-height: 390px;
      padding: 22px 18px;
    }

    .stage-actions {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
