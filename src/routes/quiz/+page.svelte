<script lang="ts">
  import { tick } from "svelte";
  import { quizPacks, type QuizPack, type QuizQuestion } from "$lib/content/quizzes";

  let activePack = $state<QuizPack | null>(null);
  let questionIndex = $state(0);
  let selectedId = $state<string | null>(null);
  let submitted = $state(false);
  let score = $state(0);
  let missed = $state<QuizQuestion[]>([]);
  let finished = $state(false);
  let pageHeading = $state<HTMLElement | null>(null);
  let feedbackPanel = $state<HTMLElement | null>(null);

  let current = $derived(activePack?.questions[questionIndex] ?? null);
  let correct = $derived(
    current !== null && selectedId !== null && selectedId === current.answerId,
  );
  let correctOption = $derived(
    current?.options.find((option) => option.id === current.answerId) ?? null,
  );

  async function focusHeading(): Promise<void> {
    await tick();
    pageHeading?.focus();
  }

  async function start(pack: QuizPack): Promise<void> {
    activePack = pack;
    questionIndex = 0;
    selectedId = null;
    submitted = false;
    score = 0;
    missed = [];
    finished = false;
    await focusHeading();
  }

  function choose(optionId: string): void {
    if (!submitted) selectedId = optionId;
  }

  async function checkAnswer(): Promise<void> {
    if (selectedId === null || current === null || submitted) return;

    submitted = true;
    if (selectedId === current.answerId) score += 1;
    else missed = [...missed, current];

    await tick();
    feedbackPanel?.focus();
  }

  async function next(): Promise<void> {
    if (activePack === null) return;

    if (questionIndex === activePack.questions.length - 1) {
      finished = true;
      await focusHeading();
      return;
    }

    questionIndex += 1;
    selectedId = null;
    submitted = false;
    await focusHeading();
  }

  function backToQuizzes(): void {
    activePack = null;
    questionIndex = 0;
    selectedId = null;
    submitted = false;
    score = 0;
    missed = [];
    finished = false;
  }

  async function restart(): Promise<void> {
    if (activePack !== null) await start(activePack);
  }

  function answerState(optionId: string): string {
    if (!submitted) return optionId === selectedId ? "selected" : "";
    if (current === null) return "";
    if (optionId === current.answerId) return "correct";
    if (optionId === selectedId) return "wrong";
    return "muted";
  }
</script>

<svelte:head>
  <title>Quizzes | Slovak Wiki</title>
  <meta
    name="description"
    content="Short Slovak quizzes for everyday language, grammar, spelling, and pronunciation."
  >
</svelte:head>

<main class="shell page quiz-page">
  {#if activePack === null}
    <section class="quiz-home">
      <header class="home-header">
        <p class="eyebrow">Quiz</p>
        <h1>Practice your Slovak</h1>
        <p>Choose a topic. Each quiz has six questions and explains every answer.</p>
      </header>

      <div class="quiz-grid" aria-label="Available quizzes">
        {#each quizPacks as pack (pack.id)}
          <article class="quiz-tile">
            <div class="tile-meta">
              <span>{pack.level}</span>
              <span>{pack.questions.length} questions</span>
            </div>
            <h2>{pack.title}</h2>
            <p>{pack.description}</p>
            <ul aria-label="Topics covered">
              {#each pack.topics as topic}
                <li>{topic}</li>
              {/each}
            </ul>
            <button class="start-button" type="button" onclick={() => start(pack)}>
              Start quiz <span aria-hidden="true">→</span>
            </button>
          </article>
        {/each}
      </div>
    </section>
  {:else if finished}
    <section class="result-card" aria-labelledby="result-heading">
      <p class="eyebrow">Quiz complete</p>
      <div class="result-score" aria-label={`${score} out of ${activePack.questions.length} correct`}>
        <strong>{score}</strong>
        <span>out of {activePack.questions.length}</span>
      </div>
      <h1 id="result-heading" bind:this={pageHeading} tabindex="-1">
        {score === activePack.questions.length
          ? "Perfect score"
          : score >= 4
            ? "Good work"
            : "Keep practicing"}
      </h1>
      <p class="result-copy">
        {missed.length
          ? `You missed ${missed.length} ${missed.length === 1 ? "question" : "questions"}. Review them below or try the quiz again.`
          : "You answered every question correctly."}
      </p>

      {#if missed.length}
        <section class="review-section" aria-labelledby="review-heading">
          <h2 id="review-heading">Review</h2>
          <ul>
            {#each missed as question (question.id)}
              <li>
                <div>
                  <strong>{question.prompt}</strong>
                  <span>Correct answer: {question.options.find((option) => option.id === question.answerId)?.label}</span>
                </div>
                <a href={question.reviewHref}>Review {question.reviewLabel}</a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <div class="result-actions">
        <button class="button" type="button" onclick={restart}>Try again</button>
        <button class="button secondary" type="button" onclick={backToQuizzes}>Choose another quiz</button>
      </div>
    </section>
  {:else if current}
    <section class="quiz-player" aria-labelledby="question-heading">
      <header class="player-header">
        <div class="player-meta">
          <button type="button" onclick={backToQuizzes}>← Back to quizzes</button>
          <span>{questionIndex + 1} / {activePack.questions.length}</span>
        </div>
        <progress
          max={activePack.questions.length}
          value={questionIndex + 1}
          aria-label={`Question ${questionIndex + 1} of ${activePack.questions.length}`}
        >
          {questionIndex + 1} of {activePack.questions.length}
        </progress>
      </header>

      <div class="question-card">
        <div class="question-header">
          <p>{activePack.title}</p>
          <h1 id="question-heading" bind:this={pageHeading} tabindex="-1">{current.prompt}</h1>
        </div>

        {#if current.context?.length}
          <div class="question-context">
            {#each current.context as line}
              <div class="context-line">
                {#if line.label}<span>{line.label}</span>{/if}
                <strong lang="sk">{line.slovak}</strong>
                {#if line.english}<small>{line.english}</small>{/if}
              </div>
            {/each}
          </div>
        {/if}

        <div class="answers" aria-label="Answer choices">
          {#each current.options as option, index (option.id)}
            {@const state = answerState(option.id)}
            <button
              class={state}
              type="button"
              disabled={submitted}
              aria-pressed={selectedId === option.id}
              onclick={() => choose(option.id)}
            >
              <span class="answer-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option.label}</span>
              {#if state === "correct"}
                <strong>Correct</strong>
              {:else if state === "wrong"}
                <strong>Your answer</strong>
              {/if}
            </button>
          {/each}
        </div>

        {#if submitted}
          <section
            class={["answer-feedback", correct ? "is-correct" : "is-wrong"]}
            aria-live="polite"
            bind:this={feedbackPanel}
            tabindex="-1"
          >
            <div>
              <h2>{correct ? "Correct" : `Answer: ${correctOption?.label}`}</h2>
              <p>{current.explanation}</p>
            </div>
            <a href={current.reviewHref}>Review {current.reviewLabel}</a>
          </section>
        {/if}

        <footer class="question-actions">
          {#if submitted}
            <button class="button" type="button" onclick={next}>
              {questionIndex === activePack.questions.length - 1 ? "See results" : "Next question"}
            </button>
          {:else}
            <button
              class="button"
              type="button"
              disabled={selectedId === null}
              onclick={checkAnswer}
            >
              Check answer
            </button>
          {/if}
        </footer>
      </div>
    </section>
  {/if}
</main>

<style>
  .quiz-page { min-height: calc(100vh - var(--header-height)); padding-top: 54px; }
  .quiz-home { max-width: 980px; margin-inline: auto; }
  .home-header { max-width: 700px; }
  .home-header h1 { font-size: clamp(2.55rem, 5vw, 4rem); }
  .home-header > p:last-child {
    max-width: 620px;
    margin: 14px 0 0;
    color: var(--muted-strong);
    font-family: var(--font-reading);
    font-size: 1.04rem;
  }

  .quiz-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    align-items: stretch;
    margin-top: 38px;
  }
  .quiz-tile {
    display: flex;
    min-height: 318px;
    flex-direction: column;
    padding: 26px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: color-mix(in srgb, var(--surface) 78%, transparent);
  }
  .quiz-tile:hover { border-color: var(--line-strong); background: color-mix(in srgb, var(--surface) 92%, white); }
  .tile-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: var(--muted);
    font-size: .65rem;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
  }
  .quiz-tile h2 {
    display: flex;
    min-height: 3.7rem;
    align-items: flex-start;
    margin: 29px 0 0;
    font-size: 1.65rem;
    line-height: 1.12;
  }
  .quiz-tile > p {
    min-height: 4.15rem;
    margin: 0;
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: .9rem;
    line-height: 1.5;
  }
  .quiz-tile ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    min-height: 1.25rem;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
  }
  .quiz-tile li {
    color: var(--muted-strong);
    font-size: .68rem;
  }
  .quiz-tile li + li::before {
    margin: 0 7px;
    color: var(--line-strong);
    content: "·";
  }
  .start-button {
    display: flex;
    min-height: 46px;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding: 14px 0 0;
    border: 0;
    border-top: 1px solid var(--line);
    border-radius: 0;
    background: transparent;
    color: var(--accent-dark);
    cursor: pointer;
    font-size: .78rem;
    font-weight: 750;
    text-align: left;
  }
  .start-button span { transition: transform 150ms ease; }
  .start-button:hover { color: var(--ink); }
  .start-button:hover span { transform: translateX(3px); }

  .quiz-player { max-width: 840px; margin-inline: auto; }
  .player-header { margin-bottom: 18px; }
  .player-meta {
    display: flex;
    min-height: 44px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    color: var(--muted);
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .player-meta button {
    min-height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    font: inherit;
  }
  .player-meta button:hover { color: var(--accent-dark); }
  progress {
    display: block;
    width: 100%;
    height: 5px;
    border: 0;
    border-radius: 99px;
    background: var(--line);
    color: var(--accent);
  }
  progress::-webkit-progress-bar { border-radius: 99px; background: var(--line); }
  progress::-webkit-progress-value { border-radius: 99px; background: var(--accent); }
  progress::-moz-progress-bar { border-radius: 99px; background: var(--accent); }

  .question-card {
    padding: clamp(28px, 5vw, 48px);
    border: 1px solid var(--line);
    border-radius: 14px;
    background: color-mix(in srgb, var(--surface) 94%, white);
    box-shadow: 0 5px 20px rgb(73 58 18 / 7%);
  }
  .question-header > p {
    margin: 0 0 9px;
    color: var(--accent);
    font-size: .65rem;
    font-weight: 750;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .question-header h1 {
    max-width: 700px;
    margin: 0;
    font-size: clamp(1.8rem, 3.5vw, 2.55rem);
    line-height: 1.15;
  }
  .question-context {
    display: grid;
    gap: 12px;
    margin-top: 25px;
    padding: 18px 20px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface-subtle);
  }
  .context-line {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 12px;
    align-items: baseline;
  }
  .context-line > span {
    color: var(--accent);
    font-size: .65rem;
    font-weight: 750;
    text-transform: uppercase;
  }
  .context-line strong {
    font-family: var(--font-reading);
    font-size: 1.17rem;
    line-height: 1.35;
  }
  .context-line small { color: var(--muted); font-size: .76rem; }

  .answers { display: grid; gap: 10px; margin-top: 28px; }
  .answers button {
    display: grid;
    width: 100%;
    min-height: 60px;
    grid-template-columns: 30px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 11px 15px;
    border: 1px solid var(--line-strong);
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 0 rgb(113 88 31 / 12%);
    color: var(--ink);
    cursor: pointer;
    font-family: var(--font-reading);
    font-size: 1rem;
    font-weight: 650;
    text-align: left;
  }
  .answer-letter {
    display: grid;
    width: 26px;
    height: 26px;
    place-items: center;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    color: var(--muted);
    font-family: var(--font-ui);
    font-size: .66rem;
    font-weight: 700;
  }
  .answers button:not(:disabled):hover { border-color: var(--accent); background: var(--surface-subtle); }
  .answers button.selected {
    border-color: var(--accent);
    background: var(--accent-soft);
    box-shadow: 0 2px 0 color-mix(in srgb, var(--accent) 35%, transparent);
  }
  .answers button.selected .answer-letter { border-color: var(--accent); color: var(--accent-dark); }
  .answers button:disabled { cursor: default; opacity: 1; }
  .answers button.muted { color: var(--muted); }
  .answers button.correct { border-color: var(--green); background: var(--green-light); color: var(--green); }
  .answers button.wrong { border-color: var(--red); background: var(--red-light); color: var(--red); }
  .answers button.correct .answer-letter { border-color: var(--green); }
  .answers button.wrong .answer-letter { border-color: var(--red); }
  .answers button > strong {
    font-family: var(--font-ui);
    font-size: .58rem;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .answer-feedback {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 24px;
    margin-top: 20px;
    padding: 18px 20px;
    border: 1px solid;
    border-radius: 8px;
  }
  .answer-feedback.is-correct { border-color: #9eb08b; background: var(--green-light); }
  .answer-feedback.is-wrong { border-color: #c99389; background: var(--red-light); }
  .answer-feedback h2 { margin: 0; font-family: var(--font-ui); font-size: .92rem; letter-spacing: 0; }
  .answer-feedback.is-correct h2 { color: var(--green); }
  .answer-feedback.is-wrong h2 { color: var(--red); }
  .answer-feedback p {
    max-width: 580px;
    margin: 5px 0 0;
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: .88rem;
    line-height: 1.5;
  }
  .answer-feedback a {
    flex: 0 0 auto;
    color: var(--accent-dark);
    font-size: .68rem;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .question-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 22px;
    border-top: 1px solid var(--line);
  }
  .question-actions .button { min-width: 145px; }

  .result-card {
    max-width: 820px;
    margin-inline: auto;
    padding: clamp(30px, 5vw, 50px);
    border: 1px solid var(--line);
    border-radius: 14px;
    background: color-mix(in srgb, var(--surface) 94%, white);
    box-shadow: 0 5px 20px rgb(73 58 18 / 7%);
  }
  .result-score { display: flex; align-items: baseline; gap: 9px; margin: 12px 0 20px; }
  .result-score strong { color: var(--accent); font-family: var(--font-reading); font-size: 4.5rem; line-height: .8; }
  .result-score span { color: var(--muted); font-size: .78rem; }
  .result-card h1 { font-size: clamp(2.3rem, 5vw, 3.55rem); }
  .result-copy { max-width: 570px; margin: 12px 0 0; color: var(--muted-strong); font-family: var(--font-reading); }
  .review-section { margin-top: 32px; }
  .review-section h2 { font-size: 1.25rem; }
  .review-section ul { margin: 13px 0 0; padding: 0; border-top: 1px solid var(--line); list-style: none; }
  .review-section li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 18px;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--line);
  }
  .review-section li > div { display: grid; gap: 4px; }
  .review-section strong { font-family: var(--font-reading); font-size: .88rem; }
  .review-section span { color: var(--muted); font-size: .7rem; }
  .review-section a { color: var(--accent-dark); font-size: .68rem; font-weight: 700; }
  .result-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }

  @media (max-width: 900px) {
    .quiz-grid { grid-template-columns: 1fr; }
    .quiz-tile { min-height: 0; }
    .quiz-tile h2, .quiz-tile > p { min-height: 0; }
    .quiz-tile > p { margin-top: 8px; }
    .start-button { margin-top: 28px; }
  }
  @media (max-width: 620px) {
    .quiz-page { padding-top: 30px; }
    .question-card { padding: 24px 18px; }
    .context-line { grid-template-columns: 1fr; gap: 3px; }
    .answer-feedback { align-items: stretch; flex-direction: column; }
    .question-actions .button { width: 100%; }
    .review-section li { grid-template-columns: 1fr; gap: 8px; }
  }
  @media (max-width: 420px) {
    .home-header h1 { font-size: 2.35rem; }
    .quiz-tile { padding: 22px 20px; }
    .answers button { grid-template-columns: 30px minmax(0, 1fr); }
    .answers button > strong { grid-column: 2; }
  }
</style>
