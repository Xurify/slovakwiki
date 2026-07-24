<script lang="ts">
  import type { ContentEntry } from "$lib/content/types";

  let { entry }: { entry: ContentEntry } = $props();

  const routeBase = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };
</script>

<a class="entry-card" href="/{routeBase[entry.kind]}/{entry.slug}">
  <span class="kind">{entry.kind}</span>
  <h3 lang="sk">{entry.slovak}</h3>
  <p class="meaning">{entry.english}</p>
  <p class="summary">{entry.summary}</p>
  <span class="read">Open entry <span aria-hidden="true">→</span></span>
</a>

<style>
  .entry-card {
    position: relative;
    display: flex;
    min-height: 210px;
    flex-direction: column;
    padding: 22px 24px 24px 0;
    border: 0;
    border-bottom: 1px solid var(--line);
    border-radius: 0;
    background: transparent;
    transition:
      border-color 160ms ease,
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .entry-card:hover {
    transform: none;
    box-shadow: none;
  }

  .entry-card:nth-child(even) {
    padding-right: 0;
    padding-left: 24px;
    border-left: 1px solid var(--line);
  }

  .kind {
    align-self: start;
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: var(--muted);
    font-size: 0.7rem;
    font-weight: 750;
    text-transform: capitalize;
  }

  h3 {
    margin: 16px 0 2px;
    color: var(--blue);
    font-size: 1.45rem;
  }

  p {
    margin: 0;
  }

  .meaning {
    color: var(--red);
    font-weight: 680;
  }

  .summary {
    margin-top: 14px;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .read {
    margin-top: auto;
    padding-top: 20px;
    color: var(--blue);
    font-size: 0.86rem;
    font-weight: 720;
  }

  .entry-card:hover .read,
  .entry-card:hover h3 {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 800px) {
    .entry-card,
    .entry-card:nth-child(even) {
      padding-inline: 0;
      border-left: 0;
    }
  }
</style>
