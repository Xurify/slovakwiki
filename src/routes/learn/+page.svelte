<svelte:head>
  <title>First conversation | Slovak Wiki</title>
  <meta name="description" content="A short Slovak first conversation, explained line by line.">
</svelte:head>

<main class="shell page">
  <header class="lesson-head">
    <p class="eyebrow">Beginner guide</p>
    <h1>Your first Slovak conversation</h1>
    <p class="lead">Read one short exchange. Then see what each line does and when to use it.</p>
  </header>

  <section class="conversation" aria-labelledby="conversation-title">
    <div class="section-heading">
      <p class="section-label">Read this first</p>
      <h2 id="conversation-title">Meeting someone you know</h2>
      <p>Use <strong>Ahoj</strong> with a friend or peer. The English is there to keep the exchange clear, not to turn it into a word list.</p>
    </div>

    <div class="dialogue" lang="sk">
      <div class="line"><span>Anna</span><p>Ahoj!</p><small>Hi!</small></div>
      <div class="line"><span>Peter</span><p>Ahoj! Ako sa máš?</p><small>Hi! How are you?</small></div>
      <div class="line"><span>Anna</span><p>Dobre, ďakujem. A ty?</p><small>Well, thank you. And you?</small></div>
      <div class="line"><span>Peter</span><p>Aj ja dobre.</p><small>I’m well too.</small></div>
    </div>
  </section>

  <section class="breakdown" aria-labelledby="breakdown-title">
    <div class="section-heading">
      <p class="section-label">What you are learning</p>
      <h2 id="breakdown-title">Four jobs in one conversation</h2>
      <p>These are not four disconnected words. They form a sequence you can recognize and reuse.</p>
    </div>

    <div class="line-notes">
      <article>
        <p class="note-number">01</p>
        <div><h3 lang="sk">Ahoj!</h3><p><strong>Job:</strong> open the conversation casually. Use it with friends, classmates, or peers.</p></div>
      </article>
      <article>
        <p class="note-number">02</p>
        <div><h3 lang="sk">Ako sa máš?</h3><p><strong>Job:</strong> ask one person how they are. This is informal, so do not use it as your default for strangers.</p></div>
      </article>
      <article>
        <p class="note-number">03</p>
        <div><h3 lang="sk">Dobre, ďakujem.</h3><p><strong>Job:</strong> give a compact positive reply. <em>Dobre</em> means “well”; <em>ďakujem</em> means “thank you.”</p></div>
      </article>
      <article>
        <p class="note-number">04</p>
        <div><h3 lang="sk">A ty?</h3><p><strong>Job:</strong> return the question. It literally means “And you?” and keeps the exchange moving.</p></div>
      </article>
    </div>
  </section>

  <section class="contrast" aria-labelledby="contrast-title">
    <div>
      <p class="section-label">One important distinction</p>
      <h2 id="contrast-title">Friend or public setting?</h2>
    </div>
    <div class="contrast-options">
      <article><h3 lang="sk">Ahoj!</h3><p>Informal. Friends, peers, people you know.</p></article>
      <article><h3 lang="sk">Dobrý deň.</h3><p>Polite default. Shops, offices, older people, strangers.</p></article>
    </div>
  </section>

  <section class="next-step" aria-labelledby="next-title">
    <div><p class="section-label">Continue</p><h2 id="next-title">Look up words when you need them</h2><p>Learn gives the conversation shape. The dictionary and reference pages fill in detail.</p></div>
    <div class="actions"><a class="button" href="/dictionary/ahoj">Open “ahoj”</a><a class="button secondary" href="/quiz">Check your reference knowledge</a></div>
  </section>
</main>

<style>
  .lesson-head { max-width: 780px; padding-bottom: 26px; border-bottom: 1px solid var(--line); }
  .lesson-head h1 { font-size: clamp(2.45rem, 5vw, 3.8rem); }
  .conversation, .breakdown { max-width: 800px; padding: 34px 0; border-bottom: 1px solid var(--line); }
  .section-heading { max-width: 650px; }
  .section-label { margin: 0 0 7px; color: var(--accent); font-size: .61rem; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; }
  .section-heading h2, .contrast h2, .next-step h2 { margin: 0; font-size: clamp(1.55rem, 3vw, 2rem); }
  .section-heading > p:last-child, .next-step p:not(.section-label) { margin: 9px 0 0; color: var(--muted-strong); font-family: var(--font-reading); line-height: 1.55; }
  .dialogue { display: grid; gap: 0; margin-top: 26px; border-top: 1px solid var(--line); }
  .line { display: grid; grid-template-columns: 74px minmax(0, 1fr) minmax(130px, .55fr); gap: 14px; align-items: baseline; padding: 15px 12px; border-bottom: 1px solid var(--line); }
  .line:nth-child(odd) { background: color-mix(in srgb, var(--surface-subtle) 58%, transparent); }
  .line > span { color: var(--accent); font-size: .68rem; font-weight: 750; text-transform: uppercase; }
  .line p { margin: 0; font-family: var(--font-reading); font-size: 1.06rem; font-weight: 680; }
  .line small { color: var(--muted); font-size: .76rem; }
  .line-notes { display: grid; margin-top: 25px; border-top: 1px solid var(--line); }
  .line-notes article { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 14px; padding: 18px 0; border-bottom: 1px solid var(--line); }
  .note-number { margin: 2px 0 0; color: var(--accent); font-size: .68rem; font-weight: 750; }
  .line-notes h3 { margin: 0; color: var(--accent-dark); font-family: var(--font-reading); font-size: 1.1rem; }
  .line-notes article div > p { max-width: 600px; margin: 5px 0 0; color: var(--ink-soft); font-family: var(--font-reading); line-height: 1.5; }
  .contrast { display: grid; max-width: 800px; grid-template-columns: minmax(200px, .8fr) minmax(0, 1.2fr); gap: 38px; padding: 34px 0; border-bottom: 1px solid var(--line); }
  .contrast-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--line); }
  .contrast-options article { padding: 16px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .contrast-options article:first-child { border-left: 1px solid var(--line); }
  .contrast-options h3 { margin: 0; color: var(--accent-dark); font-family: var(--font-reading); font-size: 1.05rem; }
  .contrast-options p { margin: 5px 0 0; color: var(--muted); font-size: .8rem; line-height: 1.45; }
  .next-step { display: flex; max-width: 800px; align-items: end; justify-content: space-between; gap: 28px; padding: 34px 0 8px; }
  .next-step > div:first-child { max-width: 480px; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; }
  @media (max-width: 680px) { .line { grid-template-columns: 1fr; gap: 3px; } .line small { padding-left: 0; } .contrast { grid-template-columns: 1fr; gap: 20px; } .next-step { align-items: start; flex-direction: column; } }
  @media (max-width: 460px) { .contrast-options { grid-template-columns: 1fr; } .contrast-options article + article { border-left: 1px solid var(--line); } }
</style>
