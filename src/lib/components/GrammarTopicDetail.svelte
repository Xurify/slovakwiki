<script lang="ts">
  import { words } from "$lib/content/data";
  import type { GrammarTopic } from "$lib/content/types";

  let { topic }: { topic: GrammarTopic } = $props();

  const relatedWords = $derived(topic.related
    .map((slug) => words.find((word) => word.slug === slug))
    .filter((word) => word !== undefined));
</script>

<svelte:head>
  <title>{topic.english} | Slovak Wiki Grammar</title>
  <meta name="description" content={topic.summary}>
</svelte:head>

<main class="topic-page">
  <article class="topic">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/grammar">Grammar</a><span aria-hidden="true">/</span><span>{topic.pathGroup}</span>
    </nav>
    <header>
      <p class="eyebrow">Grammar reference</p>
      <h1>{topic.english}</h1>
      <p class="slovak" lang="sk">{topic.slovak}</p>
      <p class="summary">{topic.summary}</p>
    </header>

    <aside class="look-for"><p class="section-label">Look for</p><p>{topic.lookFor}</p></aside>

    <section aria-labelledby="rule-heading">
      <p class="section-label">Core rule</p>
      <h2 id="rule-heading">What changes</h2>
      {#each topic.rule as paragraph (paragraph)}
        <p>{paragraph}</p>
      {/each}
    </section>

    {#if !topic.caseOverview}
      <section class="pattern" aria-labelledby="pattern-heading">
        <p class="section-label">Pattern</p>
        <h2 id="pattern-heading">{topic.pattern.label}</h2>
        <ul>
          {#each topic.pattern.lines as line (line)}
            <li>{line}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if topic.caseOverview}
      <section id="case-map" aria-labelledby="case-map-heading">
        <p class="section-label">Case map</p>
        <h2 id="case-map-heading">The six cases</h2>
        <p class="case-intro">Learn the nominative first. Use the remaining rows as a research checklist, then add your own notes.</p>
        <ol class="case-map">
          {#each topic.caseOverview as item (item.name)}
            <li class:explained={Boolean(item.explanation)}>
              <a href="/grammar/cases/{item.slug}">
                <div><strong>{item.name}</strong>{#if item.role}<span>{item.role}</span>{/if}</div>
                {#if item.question}<p>{item.question}</p>{/if}
                {#if item.explanation}<small>{item.explanation}</small>{/if}
                {#if item.researchPrompt}<small class="research">Research: {item.researchPrompt}</small>{/if}
              </a>
            </li>
          {/each}
        </ol>
      </section>
    {/if}

    {#if !topic.caseOverview}
      <section aria-labelledby="examples-heading">
        <p class="section-label">See it in use</p>
        <h2 id="examples-heading">Examples</h2>
        <ol class="examples">
          {#each topic.examples as example (example.slovak)}
            <li><strong lang="sk">{example.slovak}</strong><span>{example.english}</span></li>
          {/each}
        </ol>
      </section>
    {/if}

    <aside class="watch-out"><p class="section-label">Note</p><p>{topic.watchOut}</p></aside>
  </article>

  <aside class="context">
    <section><p class="rail-label">In this topic</p><a href="#rule-heading">Core rule</a>{#if topic.caseOverview}<a href="#case-map">Case map</a>{:else}<a href="#pattern-heading">Pattern</a><a href="#examples-heading">Examples</a>{/if}</section>
    {#if relatedWords.length}
      <section><p class="rail-label">Words to know</p>{#each relatedWords as word (word.slug)}<a href="/dictionary/{word.slug}" lang="sk">{word.slovak}<small>{word.english}</small></a>{/each}</section>
    {/if}
  </aside>
</main>

<style>
  .topic-page { display:grid; grid-template-columns:minmax(0, 760px) 210px; justify-content:center; gap:54px; padding:38px 30px 74px; }
  .topic { min-width:0; }
  .breadcrumb { display:flex; gap:7px; color:var(--muted); font-size:.7rem; }
  .breadcrumb a { color:var(--accent-dark); text-decoration:underline; text-underline-offset:3px; }
  header { padding:24px 0 28px; border-bottom:1px solid var(--line); }
  h1 { font-size:clamp(2.5rem,5vw,4.35rem); }
  .eyebrow,.section-label,.rail-label { margin:0 0 8px; color:var(--accent); font-size:.64rem; font-weight:750; letter-spacing:.1em; text-transform:uppercase; }
  .slovak { margin:7px 0 0; color:var(--accent-dark); font-family:var(--font-reading); font-size:1.1rem; }
  .summary { margin:17px 0 0; color:var(--ink-soft); font-family:var(--font-reading); font-size:1.05rem; }
  .look-for { margin-top:24px; padding:15px 17px; border-left:3px solid var(--accent); background:color-mix(in srgb,var(--accent-soft) 58%,transparent); } .look-for p:last-child { margin:0; color:var(--ink-soft); font-family:var(--font-reading); line-height:1.55; }
  section { scroll-margin-top:72px; padding-top:34px; }
  section + section { margin-top:25px; border-top:1px solid var(--line); }
  h2 { margin-bottom:11px; font-size:1.5rem; }
  section > p:not(.section-label), .watch-out p:last-child { max-width:66ch; color:var(--ink-soft); font-family:var(--font-reading); line-height:1.7; }
  .pattern ul { margin:18px 0 0; padding:0; border:1px solid var(--line); border-radius:10px; list-style:none; }
  .pattern li { padding:13px 16px; border-bottom:1px solid var(--line); color:var(--accent-dark); font-family:var(--font-reading); font-weight:650; }
  .pattern li:last-child { border-bottom:0; }
  .case-intro { margin:0 0 15px; color:var(--muted); font-family:var(--font-reading); } .case-map { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin:0; padding:0; list-style:none; } .case-map li { min-height:104px; border:1px solid var(--line); background:color-mix(in srgb,var(--surface-subtle) 45%,transparent); } .case-map li:hover { border-color:var(--line-strong); background:var(--accent-soft); } .case-map li.explained { grid-column:1 / -1; border-color:var(--line-strong); background:var(--accent-soft); } .case-map li a { display:grid; min-height:102px; gap:4px; padding:13px; } .case-map li a:hover strong { text-decoration:underline; text-underline-offset:3px; } .case-map li div { display:flex; justify-content:space-between; gap:10px; } .case-map strong { color:var(--accent-dark); font-family:var(--font-reading); } .case-map span,.case-map p { margin:0; color:var(--muted); font-size:.76rem; } .case-map small { color:var(--ink-soft); font-family:var(--font-reading); font-size:.8rem; line-height:1.45; } .case-map .research { color:var(--muted); font-family:var(--font-ui); font-size:.71rem; font-style:italic; }
  .examples { display:grid; gap:8px; margin:18px 0 0; padding:0; list-style:none; }
  .examples li { display:grid; gap:3px; padding:13px 15px; border-left:3px solid var(--accent); background:color-mix(in srgb,var(--surface-subtle) 65%,transparent); }
  .examples strong { font-family:var(--font-reading); } .examples span { color:var(--muted); font-size:.8rem; }
  .watch-out { margin-top:28px; padding:17px; border:1px solid var(--line-strong); border-radius:10px; background:var(--accent-soft); }
  .watch-out p:last-child { margin:0; }
  .context { position:sticky; top:var(--header-height); height:fit-content; padding-left:18px; border-left:1px solid var(--line); }
  .context section { padding:0; border:0; } .context section + section { margin-top:28px; }
  .context a { display:grid; gap:2px; padding:6px 0; color:var(--ink-soft); font-family:var(--font-reading); font-size:.8rem; }
  .context a:hover { color:var(--accent-dark); text-decoration:underline; text-underline-offset:3px; } .context small { color:var(--muted); font-size:.68rem; }
  @media (max-width:900px) { .topic-page { display:block; padding:30px 24px 54px; } .context { position:static; display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:35px; padding:26px 0 0; border-top:1px solid var(--line); border-left:0; } .context section + section { margin-top:0; } }
  @media (max-width:560px) { .topic-page { padding:27px 14px 42px; } .context,.case-map { grid-template-columns:1fr; gap:25px; } .case-map li.explained { grid-column:auto; } }
</style>
