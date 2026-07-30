<script lang="ts">
  import { pronunciationEntries } from "$lib/content/data";

  const groups = ["Rhythm", "Vowels", "Consonants", "Spelling"] as const;
</script>

<svelte:head><title>Slovak pronunciation | Slovak Wiki</title><meta name="description" content="A compact reference for Slovak sounds, stress, and spelling."></svelte:head>

<main class="reference-page">
  <header class="page-header"><div class="shell"><p class="breadcrumb">Reference / Pronunciation</p><h1>Pronunciation</h1><p>Sounds, stress, vowel length, and marked consonants in Slovak.</p></div></header>
  <section class="shell index" aria-label="Pronunciation topics">
    {#each groups as group (group)}
      {@const topics = pronunciationEntries.filter((topic) => topic.pathGroup === group)}
      {#if topics.length}
        <section><h2>{group}</h2><div class="topic-list">{#each topics as topic (topic.slug)}<a href="/pronunciation/{topic.slug}"><strong>{topic.english}</strong><span lang="sk">{topic.slovak}</span><p>{topic.summary}</p><i aria-hidden="true">›</i></a>{/each}</div></section>
      {/if}
    {/each}
  </section>
</main>

<style>
  .page-header { padding:28px 0 25px; border-bottom:1px solid var(--line); background:color-mix(in srgb,var(--surface-subtle) 40%,transparent); } .breadcrumb { margin:0 0 16px; color:var(--accent); font-size:.7rem; font-weight:750; letter-spacing:.06em; text-transform:uppercase; } h1 { font-size:clamp(2.45rem,5vw,4rem); } .page-header p:last-child { max-width:590px; margin:10px 0 0; color:var(--ink-soft); font-family:var(--font-reading); font-size:1rem; }
  .index { max-width:980px; padding-block:30px 64px; } .index > section + section { margin-top:27px; } h2 { padding-bottom:8px; border-bottom:1px solid var(--line-strong); font-size:1.23rem; } .topic-list { border-bottom:1px solid var(--line); } .topic-list a { display:grid; grid-template-columns:minmax(150px,.76fr) minmax(135px,.62fr) minmax(0,1.5fr) 18px; align-items:center; gap:18px; min-height:61px; padding:9px 12px; border-top:1px solid var(--line); } .topic-list a:hover { background:color-mix(in srgb,var(--surface-subtle) 70%,transparent); } .topic-list a:hover strong { text-decoration:underline; text-underline-offset:3px; } .topic-list strong { color:var(--accent-dark); font-family:var(--font-reading); font-size:1rem; } .topic-list span { color:var(--muted); font-family:var(--font-reading); font-size:.82rem; } .topic-list p { margin:0; color:var(--ink-soft); font-family:var(--font-reading); font-size:.82rem; line-height:1.45; } .topic-list i { color:var(--accent); font-size:1.3rem; font-style:normal; }
  @media (max-width:650px) { .page-header { padding-block:24px; } .page-header .shell { width:min(100% - 28px,680px); } .index { padding:26px 14px 50px; } .topic-list a { grid-template-columns:1fr 16px; gap:3px 10px; padding-block:13px; } .topic-list span,.topic-list p { grid-column:1; } .topic-list i { grid-column:2; grid-row:1 / 4; } }
</style>
