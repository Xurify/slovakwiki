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
        left.localeCompare(right)
      ),
      prompt: word.slovak,
    };
  });

  let currentQuestion = $state(0);
  let selectedAnswer = $state<string | null>(null);
  let score = $state(0);
  let finished = $state(false);

  function handleSelect(option: string): void {
    if (selectedAnswer) {
      return;
    }
    selectedAnswer = option;
    if (option === questions[currentQuestion].answer) {
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
</script>

<svelte:head>
  <title>Slovak Vocabulary Quiz | Slovak Atlas</title>
  <meta
    name="description"
    content="Practice essential Slovak vocabulary in a quick quiz."
  >
</svelte:head>

<main class="quiz-page">
  <div class="shell quiz-shell">
    <p class="eyebrow">Quick practice</p>
    {#if finished}
      <section class="quiz-card result">
        <span class="score">{score}/{questions.length}</span>
        <h1>
          {score >= 8 ? "Strong recall." : score >= 5 ? "Good foundation." : "Keep mapping."}
        </h1>
        <p>You recognized {score} essential Slovak words.</p>
        <div class="actions">
          <button class="button" type="button" onclick={handleRestart}>Try again</button>
          <a class="button secondary" href="/wiki">Review the wiki</a>
        </div>
      </section>
    {:else}
      <div class="quiz-meta">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span>{score} correct</span>
      </div>
      <section class="quiz-card">
        <p class="prompt-label">What does this mean?</p>
        <h1 lang="sk">{questions[currentQuestion].prompt}</h1>
        <div class="options">
          {#each questions[currentQuestion].options as option}
            <button
              class:correct={selectedAnswer && option === questions[currentQuestion].answer}
              class:wrong={selectedAnswer === option && option !== questions[currentQuestion].answer}
              type="button"
              onclick={() => handleSelect(option)}
            >
              {option}
            </button>
          {/each}
        </div>
        {#if selectedAnswer}
          <div class="feedback">
            <strong
              >{selectedAnswer === questions[currentQuestion].answer ? "Correct" : "Not quite"}</strong
            >
            <button class="button" type="button" onclick={handleNext}>
              {currentQuestion === questions.length - 1 ? "See results" : "Next question"}
            </button>
          </div>
        {/if}
      </section>
    {/if}
  </div>
</main>

<style>
  .quiz-page {
    min-height: calc(100vh - 72px);
    padding-block: 50px 80px;
    background: var(--sky);
  }

  .quiz-shell {
    max-width: 800px;
  }

  .quiz-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    color: var(--muted);
    font-size: 0.78rem;
    font-weight: 650;
  }

  .quiz-card {
    min-height: 510px;
    padding: 52px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    box-shadow: none;
  }

  .prompt-label {
    margin: 0;
    color: var(--muted);
    font-size: 0.82rem;
  }

  h1 {
    margin-top: 25px;
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: clamp(3rem, 8vw, 5.4rem);
  }

  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 45px;
  }

  .options button {
    min-height: 65px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    font-weight: 650;
  }

  .options button:hover {
    border-color: var(--plum);
    background: var(--surface);
  }

  .options button.correct {
    border-color: var(--green);
    background: #e3f3ed;
    color: var(--green);
  }

  .options button.wrong {
    border-color: var(--red);
    background: var(--red-light);
    color: var(--coral);
  }

  .feedback {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-top: 30px;
    padding-top: 24px;
    border-top: 1px solid var(--line);
  }

  .result {
    display: grid;
    align-content: center;
    justify-items: start;
  }

  .result .score {
    color: var(--red);
    font-family: "Fraunces Variable", serif;
    font-size: 2rem;
    font-weight: 700;
  }

  .result h1 {
    margin-top: 12px;
    font-size: clamp(2.7rem, 7vw, 4.8rem);
  }

  .result p {
    color: var(--muted);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;
  }

  @media (max-width: 620px) {
    .quiz-page {
      padding-block: 30px 55px;
    }

    .quiz-card {
      min-height: 480px;
      padding: 34px 22px;
    }

    .options {
      grid-template-columns: 1fr;
      margin-top: 35px;
    }

    .feedback {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
