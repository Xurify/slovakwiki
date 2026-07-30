<script lang="ts">
  type Question = {
    id: string;
    prompt: string;
    options: string[];
    answer: string;
    explanation: string;
    reviewHref: string;
  };

  type QuizPack = {
    id: string;
    title: string;
    description: string;
    questions: Question[];
  };

  const packs: QuizPack[] = [
    {
      id: "everyday-words",
      title: "Everyday words",
      description: "Questions, polite phrases, and useful travel words.",
      questions: [
        { id: "kde", prompt: "What does kde mean?", options: ["where", "who", "how much"], answer: "where", explanation: "Kde asks about location: Kde je stanica? means “Where is the station?”", reviewHref: "/dictionary/kde" },
        { id: "kolko", prompt: "Which Slovak word asks “how much?” or “how many?”", options: ["koľko", "ako", "čo"], answer: "koľko", explanation: "Koľko asks about quantity or price: Koľko to stojí? means “How much does it cost?”", reviewHref: "/dictionary/kolko" },
        { id: "prepacte", prompt: "You need to politely say “Excuse me.” Which phrase fits?", options: ["Prepáčte.", "Dovidenia.", "Rozumiem."], answer: "Prepáčte.", explanation: "Prepáčte is a polite “Excuse me” or “Sorry,” useful when approaching someone.", reviewHref: "/dictionary/prepacte" },
        { id: "rozumiem", prompt: "What does Rozumiem. mean?", options: ["I understand.", "I am learning.", "I speak Slovak."], answer: "I understand.", explanation: "Rozumiem is the first-person present form: “I understand.”", reviewHref: "/dictionary/rozumiem" },
        { id: "listok", prompt: "What does lístok mean in Jeden lístok do Košíc, prosím.?", options: ["ticket", "station", "coffee"], answer: "ticket", explanation: "Lístok means “ticket” here. The phrase asks for one ticket to Košice.", reviewHref: "/dictionary/listok" },
      ],
    },
    {
      id: "grammar-basics",
      title: "Grammar basics",
      description: "Gender, cases, verbs, and the shape of a sentence.",
      questions: [
        { id: "nominative", prompt: "What does the nominative case usually mark?", options: ["The subject doing the action", "A place someone is in", "A thing someone owns"], answer: "The subject doing the action", explanation: "In Peter číta knihu, Peter is nominative because Peter performs the reading.", reviewHref: "/grammar/cases/nominative" },
        { id: "gender", prompt: "Which adjective ending matches a feminine noun in the reference examples?", options: ["-á", "-ý", "-é"], answer: "-á", explanation: "The example dobrá žena shows the feminine adjective ending -á.", reviewHref: "/grammar/grammatical-gender" },
        { id: "present", prompt: "Why can Slovak often omit subject pronouns in the present tense?", options: ["Verb endings often show who acts", "Nouns replace all pronouns", "Questions have no subjects"], answer: "Verb endings often show who acts", explanation: "Present-tense endings carry person information, so the subject is often clear from the verb.", reviewHref: "/grammar/present-tense" },
        { id: "word-order", prompt: "What does moving a word to the front often do in Slovak?", options: ["Adds emphasis", "Makes it plural", "Changes it into a question"], answer: "Adds emphasis", explanation: "Word order is flexible, but moving a word can place emphasis on it.", reviewHref: "/grammar/word-order" },
        { id: "gender-neuter", prompt: "Which phrase uses a neuter adjective ending?", options: ["dobré mesto", "dobrá žena", "dobrý muž"], answer: "dobré mesto", explanation: "Mesto is neuter, so the adjective takes the ending -é: dobré mesto.", reviewHref: "/grammar/grammatical-gender" },
      ],
    },
    {
      id: "sounds-spelling",
      title: "Sounds & spelling",
      description: "Stress and vowel length—the two things learners miss first.",
      questions: [
        { id: "stress", prompt: "Where does Slovak word stress normally fall?", options: ["First syllable", "Last syllable", "The longest vowel"], answer: "First syllable", explanation: "Slovak normally stresses the first syllable. A long vowel mark does not change that.", reviewHref: "/pronunciation/first-syllable-stress" },
        { id: "length", prompt: "What does an acute mark in á, é, í, ó, ú, or ý show?", options: ["A longer vowel", "A louder vowel", "A different word order"], answer: "A longer vowel", explanation: "Acute marks lengthen vowels. Give the vowel more time, not more force.", reviewHref: "/pronunciation/vowel-length" },
        { id: "dakujem-stress", prompt: "Which stress pattern matches ďakujem?", options: ["ĎA-ku-jem", "ďa-KU-jem", "ďa-ku-JEM"], answer: "ĎA-ku-jem", explanation: "The first syllable carries the stress: ĎA-ku-jem.", reviewHref: "/pronunciation/first-syllable-stress" },
        { id: "kava-length", prompt: "What should you preserve in káva?", options: ["The long á vowel", "Stress on the final syllable", "A silent consonant"], answer: "The long á vowel", explanation: "The á is longer than a plain a. It can still be the stressed first syllable.", reviewHref: "/pronunciation/vowel-length" },
        { id: "length-not-stress", prompt: "A long vowel mark tells you…", options: ["Length, not stress", "Stress, not length", "Plural, not singular"], answer: "Length, not stress", explanation: "Stress and vowel length are separate. Slovak normally keeps stress on the first syllable.", reviewHref: "/pronunciation/vowel-length" },
      ],
    },
  ];

  let activePack = $state<QuizPack | null>(null);
  let questionIndex = $state(0);
  let selectedAnswer = $state<string | null>(null);
  let score = $state(0);
  let missed = $state<Question[]>([]);
  let finished = $state(false);

  let current = $derived(activePack?.questions[questionIndex] ?? null);
  let correct = $derived(current !== null && selectedAnswer === current.answer);

  function start(pack: QuizPack): void {
    activePack = pack;
    questionIndex = 0;
    selectedAnswer = null;
    score = 0;
    missed = [];
    finished = false;
  }

  function answer(option: string): void {
    if (selectedAnswer !== null || current === null) return;
    selectedAnswer = option;
    if (option === current.answer) score += 1;
    else missed = [...missed, current];
  }

  function next(): void {
    if (activePack === null) return;
    if (questionIndex === activePack.questions.length - 1) {
      finished = true;
      return;
    }
    questionIndex += 1;
    selectedAnswer = null;
  }

  function chooseAnother(): void {
    activePack = null;
    questionIndex = 0;
    selectedAnswer = null;
    score = 0;
    missed = [];
    finished = false;
  }

  function restartCurrent(): void {
    if (activePack !== null) start(activePack);
  }

  function optionStatus(option: string): string {
    if (selectedAnswer === null || current === null) return "";
    if (option === current.answer) return "correct";
    if (option === selectedAnswer) return "wrong";
    return "inactive";
  }
</script>

<svelte:head>
  <title>Quiz | Slovak Wiki</title>
  <meta name="description" content="Short Slovak reference quizzes for words, grammar, and pronunciation.">
</svelte:head>

<main class="shell page">
  {#if activePack === null}
    <header class="quiz-head">
      <p class="eyebrow">Quiz</p>
      <h1>Check what stuck.</h1>
      <p class="lead">Choose a short set. Each one has five questions and sends you straight back to the relevant reference when you miss something.</p>
    </header>

    <section class="pack-list" aria-label="Choose a quiz">
      {#each packs as pack (pack.id)}
        <button type="button" onclick={() => start(pack)}>
          <span class="pack-count">5 questions</span>
          <strong>{pack.title}</strong>
          <span class="pack-description">{pack.description}</span>
          <span class="start">Start <span aria-hidden="true">→</span></span>
        </button>
      {/each}
    </section>
  {:else if finished}
    <section class="result" aria-labelledby="result-title">
      <p class="eyebrow">{activePack.title}</p>
      <div class="score"><strong>{score}</strong><span>out of {activePack.questions.length}</span></div>
      <h1 id="result-title">{score === activePack.questions.length ? "Clean sweep." : score >= 3 ? "Good foundation." : "Use the reference, then retry."}</h1>
      <p>{missed.length ? "Review only the pages connected to your missed answers." : "Nothing to review from this set."}</p>

      {#if missed.length}
        <ul class="review-list">
          {#each missed as question (question.id)}
            <li><a href={question.reviewHref}><span>Review</span><strong>{question.prompt}</strong><small>Open →</small></a></li>
          {/each}
        </ul>
      {/if}

      <div class="actions"><button class="button" type="button" onclick={restartCurrent}>Try this set again</button><button class="button secondary" type="button" onclick={chooseAnother}>Choose another set</button></div>
    </section>
  {:else if current}
    <section class="quiz-card" aria-labelledby="question-title">
      <div class="quiz-meta"><button type="button" onclick={chooseAnother}>← Sets</button><span>{questionIndex + 1} of {activePack.questions.length}</span></div>
      <progress max={activePack.questions.length} value={questionIndex}>{questionIndex} of {activePack.questions.length}</progress>
      <div class="question-copy"><p>{activePack.title}</p><h1 id="question-title">{current.prompt}</h1></div>

      <div class="answers">
        {#each current.options as option, index (option)}
          {@const status = optionStatus(option)}
          <button class={status} type="button" disabled={selectedAnswer !== null} onclick={() => answer(option)}>
            <span class="answer-key">{String.fromCharCode(65 + index)}</span><span>{option}</span>
            {#if status === "correct"}<strong>Correct</strong>{:else if status === "wrong"}<strong>Your answer</strong>{/if}
          </button>
        {/each}
      </div>

      <div class="feedback" aria-live="polite">
        {#if selectedAnswer === null}
          <p>Choose one answer.</p>
        {:else}
          <div class={["feedback-panel", correct ? "right" : "wrong"]}><strong>{correct ? "Correct." : "Not quite."}</strong><span>{current.explanation}</span></div>
          <button class="button" type="button" onclick={next}>{questionIndex === activePack.questions.length - 1 ? "See result" : "Next"}</button>
        {/if}
      </div>
    </section>
  {/if}
</main>

<style>
  .quiz-head { max-width: 720px; padding-bottom: 26px; border-bottom: 1px solid var(--line); }
  .quiz-head h1, .result h1, .quiz-card h1 { margin: 0; font-size: clamp(2.5rem, 5vw, 3.8rem); line-height: 1.04; }
  .lead { max-width: 640px; }
  .pack-list { display: grid; max-width: 840px; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 30px; }
  .pack-list button { display: grid; min-height: 245px; align-content: start; justify-items: start; padding: 22px; border: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 74%, transparent); color: var(--ink); cursor: pointer; text-align: left; }
  .pack-list button:hover { border-color: var(--accent); background: var(--surface-subtle); }
  .pack-count, .quiz-meta, .review-list span { color: var(--accent); font-size: .63rem; font-weight: 750; letter-spacing: .09em; text-transform: uppercase; }
  .pack-list strong { margin-top: 34px; color: var(--accent-dark); font-family: var(--font-reading); font-size: 1.35rem; }
  .pack-description { margin-top: 9px; color: var(--muted); font-family: var(--font-reading); font-size: .85rem; line-height: 1.5; }
  .start { margin-top: auto; padding-top: 24px; color: var(--blue); font-size: .78rem; font-weight: 700; }
  .quiz-card, .result { max-width: 720px; margin-top: 34px; }
  .quiz-card { min-height: 620px; padding: 12px 0 30px; }
  .quiz-meta { display: flex; align-items: center; justify-content: space-between; gap: 16px; color: var(--muted); }
  .quiz-meta button { padding: 6px 0; border: 0; background: transparent; color: var(--muted); cursor: pointer; font: inherit; font-size: .72rem; }
  .quiz-meta button:hover { color: var(--accent-dark); }
  progress { display: block; width: 100%; height: 7px; margin-top: 16px; border: 0; border-radius: 99px; background: var(--line); color: var(--blue); }
  progress::-webkit-progress-bar { background: var(--line); } progress::-webkit-progress-value, progress::-moz-progress-bar { background: var(--blue); }
  .question-copy { margin-top: 46px; }
  .question-copy > p { margin: 0 0 9px; color: var(--accent); font-size: .67rem; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
  .quiz-card h1 { max-width: 620px; margin: 0; font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.16; }
  .answers { display: grid; gap: 12px; margin-top: 42px; }
  .answers button { display: grid; width: 100%; min-height: 62px; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px 15px; border: 1px solid var(--line-strong); border-radius: 9px; background: color-mix(in srgb, var(--surface) 86%, white); box-shadow: 0 2px 0 color-mix(in srgb, var(--line-strong) 55%, transparent); color: var(--ink); cursor: pointer; font-family: var(--font-reading); font-size: 1rem; font-weight: 650; text-align: left; }
  .answer-key { display: grid; width: 24px; height: 24px; place-items: center; border: 1px solid var(--line-strong); border-radius: 50%; color: var(--muted); font-family: var(--font-sans); font-size: .63rem; font-weight: 700; }
  .answers button:not(:disabled):hover { border-color: var(--blue); background: var(--surface-subtle); box-shadow: 0 2px 0 color-mix(in srgb, var(--blue) 40%, transparent); }
  .answers button:disabled { cursor: default; opacity: 1; } .answers button.inactive { color: var(--muted); }
  .answers button.correct { border-color: var(--green); background: var(--green-light); box-shadow: 0 2px 0 color-mix(in srgb, var(--green) 35%, transparent); color: var(--green); } .answers button.wrong { border-color: var(--red); background: var(--red-light); box-shadow: 0 2px 0 color-mix(in srgb, var(--red) 32%, transparent); color: var(--red); }
  .answers button.correct .answer-key { border-color: var(--green); } .answers button.wrong .answer-key { border-color: var(--red); }
  .answers button strong { font-family: var(--font-sans); font-size: .6rem; letter-spacing: .07em; text-transform: uppercase; }
  .feedback { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 16px; min-height: 92px; margin-top: 21px; }
  .feedback > p { margin: 0; color: var(--muted); font-size: .82rem; } .feedback-panel { display: grid; gap: 4px; padding: 14px 16px; border-radius: 9px; font-size: .83rem; line-height: 1.45; } .feedback span { color: var(--muted-strong); } .feedback .right { background: var(--green-light); } .feedback .right strong { color: var(--green); } .feedback .wrong { background: var(--red-light); } .feedback .wrong strong { color: var(--red); }
  .feedback .button { min-width: 106px; border-color: var(--green); background: var(--green); color: white; }
  .feedback .button:hover { border-color: var(--green); background: color-mix(in srgb, var(--green) 88%, black); }
  .result { display: grid; min-height: 390px; align-content: center; justify-items: start; padding: 40px; border: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 78%, transparent); }
  .score { display: flex; align-items: baseline; gap: 8px; margin: 9px 0 17px; } .score strong { color: var(--blue); font-size: 4rem; line-height: 1; } .score span, .result > p { color: var(--muted); }
  .result > p { max-width: 500px; font-family: var(--font-reading); line-height: 1.5; }
  .review-list { width: 100%; margin: 13px 0 0; padding: 0; border-top: 1px solid var(--line); list-style: none; }
  .review-list a { display: grid; grid-template-columns: 62px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line); color: var(--ink); } .review-list a:hover { background: var(--surface-subtle); } .review-list strong { font-family: var(--font-reading); font-size: .88rem; } .review-list small { color: var(--blue); font-size: .72rem; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
  @media (max-width: 760px) { .pack-list { grid-template-columns: 1fr; } .pack-list button { min-height: 0; } .pack-list strong { margin-top: 20px; } }
  @media (max-width: 560px) { .quiz-card { min-height: 0; padding: 8px 0 26px; } .result { padding: 22px 18px; } .question-copy { margin-top: 34px; } .answers { margin-top: 30px; gap: 10px; } .feedback { grid-template-columns: 1fr; align-items: stretch; } .feedback .button { width: 100%; } .review-list a { grid-template-columns: 1fr auto; } .review-list span { grid-column: 1 / -1; } }
</style>
