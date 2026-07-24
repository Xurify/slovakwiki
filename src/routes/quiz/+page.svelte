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
    {#if !finished}
      <dl>
        <div>
          <dt>Progress</dt>
          <dd>{currentQuestion + 1} / {questions.length}</dd>
        </div>
        <div>
          <dt>Correct</dt>
          <dd>{score}</dd>
        </div>
      </dl>
    {/if}
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
    </section>
  {/if}
</main>

<style>
  .quiz-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 40px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--line);
  }

  .quiz-head h1 {
    font-size: clamp(2rem, 4vw, 3rem);
  }

  dl {
    display: flex;
    margin: 0;
    border: 1px solid var(--line);
  }

  dl div {
    min-width: 96px;
    padding: 11px 14px;
  }

  dl div + div {
    border-left: 1px solid var(--line);
  }

  dt {
    color: var(--muted);
    font-size: 0.68rem;
    text-transform: uppercase;
  }

  dd {
    margin: 4px 0 0;
    font-size: 0.95rem;
    font-weight: 750;
  }

  .quiz-workspace {
    display: grid;
    grid-template-columns: minmax(280px, 0.72fr) minmax(420px, 1.28fr);
    min-height: 470px;
    margin-top: 28px;
    border: 1px solid var(--line);
  }

  .question-panel,
  .answer-panel {
    padding: 28px;
  }

  .question-panel {
    border-right: 1px solid var(--line);
    background: var(--surface-subtle);
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
    color: var(--blue);
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
    background: var(--surface);
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

  @media (max-width: 800px) {
    .quiz-workspace {
      grid-template-columns: 1fr;
    }

    .question-panel {
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }

    .prompt-label {
      margin-top: 28px;
    }
  }

  @media (max-width: 560px) {
    .quiz-head {
      align-items: start;
      flex-direction: column;
      gap: 20px;
    }

    .question-panel,
    .answer-panel,
    .result {
      padding: 22px 18px;
    }

    .feedback {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
