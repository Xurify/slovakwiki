<script lang="ts">
  import { words } from "$lib/content/data";

  const questions = words.slice(0, 10).map((word, index) => {
    const distractors = [
      words[(index + 3) % words.length].english,
      words[(index + 7) % words.length].english,
      words[(index + 11) % words.length].english,
    ];
    return {
      answer: word.english,
      options: [word.english, ...distractors].sort((left, right) =>
        left.localeCompare(right),
      ),
      prompt: word.slovak,
    };
  });

  let currentQuestion = $state(0);
  let selectedAnswer = $state<string | null>(null);
  let score = $state(0);
  let finished = $state(false);

  let current = $derived(questions[currentQuestion]);
  let feedbackText = $derived(
    selectedAnswer
      ? selectedAnswer === current.answer
        ? `Correct. ${current.prompt} means ${current.answer}.`
        : `Incorrect. ${current.prompt} means ${current.answer}.`
      : "",
  );

  function handleSelect(option: string): void {
    if (selectedAnswer) {
      return;
    }
    selectedAnswer = option;
    if (option === current.answer) {
      score += 1;
    }
  }

  function handleNext(): void {
    if (currentQuestion === questions.length - 1) {
      finished = true;
      return;
    }
    currentQuestion += 1;
    selectedAnswer = null;
  }

  function handleRestart(): void {
    currentQuestion = 0;
    selectedAnswer = null;
    score = 0;
    finished = false;
  }

  function optionStatus(option: string): string {
    if (!selectedAnswer) return "";
    if (option === current.answer) return "correct";
    if (option === selectedAnswer) return "wrong";
    return "inactive";
  }
</script>

<svelte:head>
  <title>Slovak Vocabulary Quiz | Slovak Atlas</title>
  <meta
    name="description"
    content="Practice essential Slovak vocabulary in a quick quiz."
  >
</svelte:head>

<main class="shell page">
  <header class="quiz-head">
    <div>
      <p class="eyebrow">Vocabulary assessment</p>
      <h1>Essential words</h1>
      <p class="lead">Ten Slovak prompts. Choose the closest English meaning.</p>
    </div>
  </header>

  {#if finished}
    <section class="result" aria-labelledby="result-heading">
      <p class="section-label">Assessment complete</p>
      <div class="result-score">
        <strong>{score}</strong>
        <span>out of {questions.length}</span>
      </div>
      <h2 id="result-heading">
        {score >= 8 ? "Strong recall." : score >= 5 ? "Good foundation." : "Keep mapping."}
      </h2>
      <p>You recognized {score} essential Slovak words.</p>
      <div class="actions">
        <button class="button" type="button" onclick={handleRestart}>Try again</button>
        <a class="button secondary" href="/wiki">Review the wiki</a>
      </div>
    </section>
  {:else}
    <section class="quiz-workspace" aria-labelledby="question-heading">
      <aside class="quiz-progress" aria-label="Quiz progress">
        <p class="rail-label">Assessment</p>
        <dl>
          <div>
            <dt>Question</dt>
            <dd>{currentQuestion + 1} / {questions.length}</dd>
          </div>
          <div>
            <dt>Correct</dt>
            <dd>{score}</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>Slovak → English</dd>
          </div>
        </dl>
        <ol aria-label="Question progress">
          {#each questions as question, index (question.prompt)}
            <li
              class={index === currentQuestion ? "current" : index < currentQuestion ? "done" : ""}
              aria-current={index === currentQuestion ? "step" : undefined}
            >
              <span>{index + 1}</span>
              <small>{index < currentQuestion ? "Done" : index === currentQuestion ? "Now" : ""}</small>
            </li>
          {/each}
        </ol>
      </aside>

      <div class="quiz-center">
        <div class="question-panel">
          <div class="question-meta">
            <span>Question {String(currentQuestion + 1).padStart(2, "0")}</span>
            <span>Slovak → English</span>
          </div>
          <p class="prompt-label">What does this mean?</p>
          <h2 id="question-heading" lang="sk">{current.prompt}</h2>
        </div>

        <div class="answer-panel">
          <h3>Choose one answer</h3>
          <div class="options">
            {#each current.options as option (option)}
              {@const status = optionStatus(option)}
              <button
                class={status}
                type="button"
                disabled={selectedAnswer !== null}
                aria-pressed={selectedAnswer === option}
                onclick={() => handleSelect(option)}
              >
                <span>{option}</span>
                {#if status === "correct"}
                  <strong>Correct answer</strong>
                {:else if status === "wrong"}
                  <strong>Your answer</strong>
                {/if}
              </button>
            {/each}
          </div>

          <div class="feedback" aria-live="polite" aria-atomic="true">
            {#if selectedAnswer}
              <p class={selectedAnswer === current.answer ? "selected-correct" : ""}>
                <strong>{selectedAnswer === current.answer ? "Correct" : "Not quite"}</strong>
                <span>{feedbackText}</span>
              </p>
              <button class="button" type="button" onclick={handleNext}>
                {currentQuestion === questions.length - 1 ? "See results" : "Next question"}
              </button>
            {:else}
              <p class="waiting">Select an answer to continue.</p>
            {/if}
          </div>
        </div>
      </div>

      <aside class="quiz-context" aria-label="Quiz instructions">
        <section>
          <p class="rail-label">How it works</p>
          <p>Choose the closest English meaning. Each answer locks after selection.</p>
        </section>
        <section>
          <p class="rail-label">Current score</p>
          <strong>{score}</strong>
          <span>correct so far</span>
        </section>
        <section>
          <p class="rail-label">Need review?</p>
          <a href="/wiki">Open reference index</a>
        </section>
      </aside>
    </section>
  {/if}
</main>

<style>
  .quiz-head {
    max-width: 760px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--line);
  }

  .quiz-head h1 {
    font-size: clamp(2rem, 4vw, 3rem);
  }

  .quiz-workspace {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr) 190px;
    align-items: stretch;
    min-height: 470px;
    margin-top: 28px;
    border: 1px solid var(--line);
  }

  .quiz-progress,
  .quiz-context {
    padding: 20px 16px 28px;
    background: color-mix(in srgb, var(--surface-subtle) 55%, transparent);
  }

  .quiz-progress {
    border-right: 1px solid var(--line);
  }

  .quiz-context {
    border-left: 1px solid var(--line);
  }

  .rail-label {
    margin: 0 0 10px;
    color: var(--accent);
    font-size: 0.61rem;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .quiz-progress dl {
    display: grid;
    gap: 12px;
    margin: 0 0 22px;
  }

  .quiz-progress dl div {
    display: grid;
    gap: 2px;
  }

  .quiz-progress dt {
    color: var(--muted);
    font-size: 0.61rem;
    text-transform: uppercase;
  }

  .quiz-progress dd {
    margin: 0;
    font-family: var(--font-reading);
    font-size: 0.84rem;
    font-weight: 650;
  }

  .quiz-progress ol {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 7px;
    margin: 0;
    padding: 16px 0 0;
    border-top: 1px solid var(--line);
    list-style: none;
  }

  .quiz-progress li {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--muted);
  }

  .quiz-progress li > span {
    display: grid;
    width: 23px;
    height: 23px;
    place-items: center;
    border: 1px solid var(--line);
    border-radius: 50%;
    font-size: 0.62rem;
  }

  .quiz-progress li.current > span {
    border-color: var(--accent);
    background: var(--accent);
    color: white;
  }

  .quiz-progress li.done > span {
    border-color: var(--green);
    color: var(--green);
  }

  .quiz-progress li small {
    font-size: 0.56rem;
  }

  .quiz-center {
    min-width: 0;
  }

  .question-panel,
  .answer-panel {
    padding: 28px;
  }

  .question-panel {
    border-bottom: 1px solid var(--line);
    background: transparent;
  }

  .question-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 13px;
    border-bottom: 1px solid var(--line);
    color: var(--muted);
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .prompt-label {
    margin: 48px 0 8px;
    color: var(--muted);
    font-size: 0.78rem;
  }

  .question-panel h2 {
    color: var(--ink);
    font-family: var(--font-reading);
    font-size: clamp(2.4rem, 6vw, 4.2rem);
  }

  .answer-panel h3 {
    margin: 0 0 14px;
    font-size: 0.82rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .options {
    border-top: 1px solid var(--line);
  }

  .options button {
    display: flex;
    width: 100%;
    min-height: 58px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 11px 14px;
    border: 0;
    border-bottom: 1px solid var(--line);
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    text-align: left;
    font-weight: 650;
  }

  .options button:not(:disabled):hover {
    background: var(--surface-subtle);
    box-shadow: inset 3px 0 var(--blue);
  }

  .options button:disabled {
    cursor: default;
    opacity: 1;
  }

  .options button.inactive {
    color: var(--muted);
  }

  .options button.correct {
    box-shadow: inset 4px 0 var(--green);
    background: var(--green-light);
    color: var(--green);
  }

  .options button.wrong {
    box-shadow: inset 4px 0 var(--red);
    background: var(--red-light);
    color: var(--red);
  }

  .options button strong {
    font-size: 0.68rem;
    text-transform: uppercase;
  }

  .feedback {
    display: flex;
    min-height: 91px;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
  }

  .feedback p {
    display: grid;
    gap: 4px;
    margin: 0;
    color: var(--red);
    font-size: 0.82rem;
  }

  .feedback p.selected-correct {
    color: var(--green);
  }

  .feedback p span {
    color: var(--muted-strong);
  }

  .feedback .waiting {
    color: var(--muted);
  }

  .result {
    display: grid;
    max-width: 720px;
    min-height: 420px;
    align-content: center;
    justify-items: start;
    margin-top: 28px;
    padding: 40px;
    border: 1px solid var(--line);
  }

  .result-score {
    display: flex;
    align-items: baseline;
    gap: 9px;
  }

  .result-score strong {
    color: var(--blue);
    font-size: 4.2rem;
    line-height: 1;
  }

  .result-score span,
  .result > p:not(.section-label) {
    color: var(--muted);
  }

  .result h2 {
    margin-top: 22px;
    font-size: 2rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 18px;
  }

  .quiz-context section + section {
    margin-top: 26px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
  }

  .quiz-context p:not(.rail-label) {
    margin: 0;
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .quiz-context section > strong {
    display: block;
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-size: 2.2rem;
    line-height: 1;
  }

  .quiz-context section > span {
    color: var(--muted);
    font-size: 0.65rem;
  }

  .quiz-context a {
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-size: 0.8rem;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 1050px) {
    .quiz-workspace {
      grid-template-columns: 170px minmax(0, 1fr);
    }

    .quiz-context {
      display: grid;
      grid-column: 2;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 24px;
      border-top: 1px solid var(--line);
      border-left: 0;
    }

    .quiz-context section + section {
      margin-top: 0;
      padding-top: 0;
      border-top: 0;
    }
  }

  @media (max-width: 760px) {
    .quiz-workspace {
      grid-template-columns: 1fr;
    }

    .quiz-progress {
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }

    .quiz-progress ol {
      grid-template-columns: repeat(5, 1fr);
    }

    .quiz-progress li {
      display: block;
    }

    .quiz-progress li small {
      display: none;
    }

    .quiz-context {
      grid-column: 1;
    }

    .prompt-label {
      margin-top: 28px;
    }
  }

  @media (max-width: 560px) {
    .question-panel,
    .answer-panel,
    .result {
      padding: 22px 18px;
    }

    .feedback {
      align-items: stretch;
      flex-direction: column;
    }

    .quiz-context {
      grid-template-columns: 1fr;
    }

    .quiz-context section + section {
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
    }
  }
</style>
