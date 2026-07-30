<script lang="ts">
  import { words } from "$lib/content/data";
  import type { PronunciationTopic } from "$lib/content/types";

  let { topic }: { topic: PronunciationTopic } = $props();
  const relatedWords = $derived(topic.related
    .map((slug) => words.find((word) => word.slug === slug))
    .filter((word) => word !== undefined));
</script>

<svelte:head><title>{topic.english} | Slovak Wiki Pronunciation</title><meta name="description" content={topic.summary}></svelte:head>

<main class="topic-page">
  <article class="topic">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/pronunciation">Pronunciation</a><span aria-hidden="true">/</span><span>{topic.pathGroup}</span></nav>
    <header><p class="eyebrow">Pronunciation reference</p><h1>{topic.english}</h1><p class="slovak" lang="sk">{topic.slovak}</p><p class="summary">{topic.summary}</p></header>

    <section aria-labelledby="goal-heading"><p class="section-label">Overview</p><h2 id="goal-heading">{topic.goal}</h2>{#each topic.body as paragraph (paragraph)}<p>{paragraph}</p>{/each}</section>
    <section aria-labelledby="contrast-heading"><p class="section-label">Listen for</p><h2 id="contrast-heading">Sound contrasts</h2><div class="contrasts">{#each topic.contrasts as contrast (contrast.left)}<div><strong lang="sk">{contrast.left} / {contrast.right}</strong><span>{contrast.note}</span></div>{/each}</div></section>
    <section class="cue" aria-labelledby="cue-heading"><p class="section-label">Articulation</p><h2 id="cue-heading">How it is formed</h2><p>{topic.mouthCue}</p></section>
    <section aria-labelledby="practice-heading"><p class="section-label">Examples</p><h2 id="practice-heading">Words and phrase</h2><div class="practice-words">{#each topic.practiceWords as word (word)}<span lang="sk">{word}</span>{/each}</div><blockquote><strong lang="sk">{topic.practicePhrase.slovak}</strong><span>{topic.practicePhrase.english}</span></blockquote></section>
  </article>
  <aside class="context"><section><p class="rail-label">In this sound</p><a href="#goal-heading">Hear and say</a><a href="#contrast-heading">Contrasts</a><a href="#cue-heading">Mouth cue</a><a href="#practice-heading">Practice</a></section>{#if relatedWords.length}<section><p class="rail-label">Practice words</p>{#each relatedWords as word (word.slug)}<a href="/dictionary/{word.slug}" lang="sk">{word.slovak}<small>{word.english}</small></a>{/each}</section>{/if}</aside>
</main>

<style>
  .topic-page { display:grid; grid-template-columns:minmax(0,760px) 210px; justify-content:center; gap:54px; padding:38px 30px 74px; } .topic { min-width:0; }
  .breadcrumb { display:flex; gap:7px; color:var(--muted); font-size:.7rem; } .breadcrumb a { color:var(--accent-dark); text-decoration:underline; text-underline-offset:3px; }
  header { padding:24px 0 28px; border-bottom:1px solid var(--line); } h1 { font-size:clamp(2.5rem,5vw,4.35rem); }
  .eyebrow,.section-label,.rail-label { margin:0 0 8px; color:var(--accent); font-size:.64rem; font-weight:750; letter-spacing:.1em; text-transform:uppercase; } .slovak { margin:7px 0 0; color:var(--accent-dark); font-family:var(--font-reading); font-size:1.1rem; } .summary { margin:17px 0 0; color:var(--ink-soft); font-family:var(--font-reading); font-size:1.05rem; }
  section { scroll-margin-top:72px; padding-top:34px; } section + section { margin-top:25px; border-top:1px solid var(--line); } h2 { margin-bottom:11px; font-size:1.5rem; } section > p:not(.section-label) { max-width:66ch; color:var(--ink-soft); font-family:var(--font-reading); line-height:1.7; }
  .contrasts { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-top:18px; } .contrasts div { display:grid; gap:4px; padding:14px; border:1px solid var(--line); border-radius:9px; background:color-mix(in srgb,var(--surface-subtle) 60%,transparent); } .contrasts strong { color:var(--accent-dark); font-family:var(--font-reading); } .contrasts span { color:var(--muted); font-size:.72rem; }
  .cue { padding:21px; border:1px solid var(--line-strong); border-radius:10px; background:var(--accent-soft); } .cue p:last-child { margin-bottom:0; }
  .practice-words { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; } .practice-words span { padding:7px 10px; border:1px solid var(--line-strong); border-radius:999px; color:var(--accent-dark); font-family:var(--font-reading); }
  blockquote { display:grid; gap:4px; margin:16px 0 0; padding:15px 17px; border-left:3px solid var(--accent); background:color-mix(in srgb,var(--surface-subtle) 65%,transparent); } blockquote strong { font-family:var(--font-reading); } blockquote span { color:var(--muted); font-size:.8rem; }
  .context { position:sticky; top:var(--header-height); height:fit-content; padding-left:18px; border-left:1px solid var(--line); } .context section { padding:0; border:0; } .context section + section { margin-top:28px; } .context a { display:grid; gap:2px; padding:6px 0; color:var(--ink-soft); font-family:var(--font-reading); font-size:.8rem; } .context a:hover { color:var(--accent-dark); text-decoration:underline; text-underline-offset:3px; } .context small { color:var(--muted); font-size:.68rem; }
  @media (max-width:900px) { .topic-page { display:block; padding:30px 24px 54px; } .context { position:static; display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:35px; padding:26px 0 0; border-top:1px solid var(--line); border-left:0; } .context section + section { margin-top:0; } } @media (max-width:560px) { .topic-page { padding:27px 14px 42px; } .contrasts { grid-template-columns:1fr; } .context { grid-template-columns:1fr; gap:25px; } }
</style>
