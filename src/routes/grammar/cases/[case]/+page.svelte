<script lang="ts">
  let { data } = $props();
  const topic = $derived(data.topic);
</script>

<svelte:head><title>{topic.name} case | Slovak Wiki</title><meta name="description" content={topic.summary}></svelte:head>

<main class="case-page">
  <article>
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/grammar">Grammar</a><span>/</span><a href="/grammar/cases-overview">Cases</a><span>/</span><span>{topic.name}</span></nav>
    <header><p class="eyebrow">Slovak cases</p><h1>{topic.name}</h1><p class="question">{topic.question}</p><p class="summary">{topic.summary}</p></header>

    {#if topic.status === "ready"}
      <section><p class="section-label">What it does</p><h2>Role in a sentence</h2>{#each topic.body as paragraph (paragraph)}<p>{paragraph}</p>{/each}</section>
      <section><p class="section-label">Annotated examples</p><h2>What this shows</h2><ol class="examples">{#each topic.examples as example (example.slovak)}<li><strong lang="sk">{example.slovak}</strong><span>{example.english}</span>{#if example.note}<small>{example.note}</small>{/if}</li>{/each}</ol></section>
    {:else}
      <section class="research"><p class="section-label">Research draft</p><h2>Build this reference</h2><p>This case has its own page now. Add the researched rule, common prepositions, endings, and examples here when ready.</p></section>
    {/if}

    <section class="prompts"><p class="section-label">Research prompts</p><h2>What to add</h2><ul>{#each topic.researchPrompts as prompt (prompt)}<li>{prompt}</li>{/each}</ul></section>
  </article>
</main>

<style>
  .case-page { width:min(780px,calc(100% - 48px)); margin:0 auto; padding:36px 0 74px; } .breadcrumb { display:flex; flex-wrap:wrap; gap:7px; color:var(--muted); font-size:.7rem; } .breadcrumb a { color:var(--accent-dark); text-decoration:underline; text-underline-offset:3px; } header { padding:23px 0 26px; border-bottom:1px solid var(--line); } h1 { font-size:clamp(2.6rem,5vw,4.2rem); } .eyebrow,.section-label { margin:0 0 8px; color:var(--accent); font-size:.64rem; font-weight:750; letter-spacing:.1em; text-transform:uppercase; } .question { margin:8px 0 0; color:var(--accent-dark); font-family:var(--font-reading); font-size:1.1rem; } .summary { margin:15px 0 0; color:var(--ink-soft); font-family:var(--font-reading); font-size:1.04rem; }
  section { padding-top:32px; scroll-margin-top:72px; } section + section { margin-top:24px; border-top:1px solid var(--line); } h2 { margin-bottom:11px; font-size:1.5rem; } section > p:not(.section-label) { max-width:66ch; color:var(--ink-soft); font-family:var(--font-reading); line-height:1.7; } .examples { display:grid; gap:8px; margin:18px 0 0; padding:0; list-style:none; } .examples li { display:grid; gap:4px; padding:14px 16px; border-left:3px solid var(--accent); background:color-mix(in srgb,var(--surface-subtle) 65%,transparent); } .examples strong { font-family:var(--font-reading); } .examples span { color:var(--muted); font-size:.8rem; } .examples small { padding-top:8px; border-top:1px solid var(--line); color:var(--accent-dark); font-family:var(--font-reading); font-size:.84rem; line-height:1.45; } .research { padding:20px; border:1px solid var(--line-strong); border-radius:10px; background:var(--accent-soft); } .research p:last-child { margin-bottom:0; } .prompts ul { display:grid; gap:7px; margin:0; padding:0; list-style:none; } .prompts li { padding:11px 13px; border:1px solid var(--line); color:var(--ink-soft); font-family:var(--font-reading); } @media (max-width:560px) { .case-page { width:min(100% - 28px,780px); padding-block:28px 50px; } }
</style>
