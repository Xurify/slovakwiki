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

  function handleNext(): void {
    if (currentStep < lessonWords.length - 1) {
      currentStep += 1;
    } else {
      complete = true;
    }
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
  <div class="lesson-head">
    <div>
      <p class="eyebrow">Beginner path · Lesson 1 of 4</p>
      <h1>Make first contact</h1>
      <p class="lead">
        Six phrases for greeting someone, responding, and leaving naturally.
      </p>
    </div>
    <div class="progress" aria-label="Lesson progress">
      <span
        style:width={`${complete ? 100 : ((currentStep + 1) / lessonWords.length) * 100}%`}
      ></span>
    </div>
  </div>

  {#if complete}
    <section class="lesson-card complete">
      <p class="eyebrow">Lesson complete</p>
      <h2 lang="sk">Výborne!</h2>
      <p>You can now open and close a simple Slovak conversation.</p>
      <div class="actions">
        <a class="button" href="/quiz">Practice these words</a>
        <button
          class="button secondary"
          type="button"
          onclick={() => { currentStep = 0; complete = false; }}
        >
          Review lesson
        </button>
      </div>
    </section>
  {:else}
    <section class="lesson-card">
      <div class="counter">
        {String(currentStep + 1).padStart(2, "0")}
        / {String(lessonWords.length).padStart(2, "0")}
      </div>
      <p class="slovak" lang="sk">{lessonWords[currentStep].slovak}</p>
      <p class="english">{lessonWords[currentStep].english}</p>
      <div class="note">
        <span>Usage</span>
        <p>{lessonWords[currentStep].note}</p>
      </div>
      <button class="button" type="button" onclick={handleNext}>
        {currentStep === lessonWords.length - 1 ? "Finish lesson" : "Next phrase"}
      </button>
    </section>
  {/if}

  <aside class="lesson-list">
    {#each lessonWords as phrase, index}
      <button
        class:active={index === currentStep && !complete}
        class:seen={index < currentStep || complete}
        type="button"
        onclick={() => { currentStep = index; complete = false; }}
      >
        <span>{index < currentStep || complete ? "✓" : index + 1}</span>
        <strong lang="sk">{phrase.slovak}</strong>
      </button>
    {/each}
  </aside>
</main>

<style>
  h1 {
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: clamp(2.6rem, 5vw, 4.5rem);
  }

  .lesson-head {
    display: grid;
    grid-template-columns: 1fr 280px;
    align-items: end;
    gap: 50px;
    padding: 32px 36px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--sky);
  }

  .progress {
    overflow: hidden;
    height: 8px;
    border-radius: 999px;
    background: color-mix(in oklch, var(--plum) 14%, transparent);
  }

  .progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--coral);
    transition: width 300ms ease;
  }

  .lesson-card {
    position: relative;
    max-width: 760px;
    min-height: 430px;
    margin-top: 48px;
    padding: 48px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    box-shadow: none;
  }

  .counter {
    position: absolute;
    top: 25px;
    right: 28px;
    color: var(--muted);
    font-size: 0.75rem;
  }

  .slovak {
    margin: 25px 0 0;
    color: var(--coral);
    font-family: "Fraunces Variable", serif;
    font-size: clamp(3rem, 7vw, 5.4rem);
    font-weight: 720;
    line-height: 1;
  }

  .english {
    margin: 12px 0 0;
    color: var(--plum);
    font-size: 1.3rem;
    font-weight: 650;
  }

  .note {
    max-width: 520px;
    margin-block: 40px 30px;
    padding: 16px 18px;
    border-radius: 5px;
    background: var(--sage-soft);
  }

  .note span {
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 750;
    text-transform: uppercase;
  }

  .note p {
    margin: 7px 0 0;
  }

  .complete {
    min-height: 340px;
  }

  .complete h2 {
    color: var(--plum);
    font-size: 4rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
  }

  .lesson-list {
    display: flex;
    max-width: 760px;
    overflow-x: auto;
    gap: 8px;
    margin-top: 18px;
  }

  .lesson-list button {
    display: flex;
    min-width: 115px;
    flex: 1;
    align-items: center;
    gap: 8px;
    padding: 10px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
  }

  .lesson-list button.active {
    border-color: var(--blue);
    color: var(--blue);
  }

  .lesson-list button.seen span {
    color: var(--green);
  }

  .lesson-list strong {
    overflow: hidden;
    font-size: 0.78rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 800px) {
    .lesson-head {
      grid-template-columns: 1fr;
      gap: 28px;
      padding: 26px 22px;
    }

    .lesson-card {
      min-height: 390px;
      padding: 35px 25px;
    }
  }
</style>
