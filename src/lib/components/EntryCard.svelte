<script lang="ts">
  import type { ContentEntry } from "$lib/content/types";

  let { entry }: { entry: ContentEntry } = $props();

  const routeBase = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };

  const kindLabel = {
    grammar: "Grammar",
    pronunciation: "Pronunciation",
    word: "Word",
  };
</script>

<a class="entry-row" href="/{routeBase[entry.kind]}/{entry.slug}">
  <span class="kind">{kindLabel[entry.kind]}</span>
  <span class="term">
    <strong lang="sk">{entry.slovak}</strong>
    <small>{entry.english}</small>
  </span>
  <span class="summary">{entry.summary}</span>
  <span class="open" aria-hidden="true">›</span>
</a>

<style>
  .entry-row {
    display: grid;
    grid-template-columns: 110px minmax(180px, 0.8fr) minmax(260px, 1.5fr) 20px;
    align-items: center;
    gap: 18px;
    min-height: 72px;
    padding: 12px 10px;
    border-bottom: 1px solid var(--line);
  }

  .entry-row:hover {
    background: color-mix(in srgb, var(--surface-subtle) 65%, transparent);
  }

  .entry-row:hover strong {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .kind {
    color: var(--muted);
    font-size: 0.7rem;
    font-weight: 750;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .term {
    display: grid;
    gap: 3px;
  }

  strong {
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-size: 1.02rem;
  }

  small {
    color: var(--muted-strong);
    font-family: var(--font-reading);
    font-size: 0.8rem;
  }

  .summary {
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: 0.84rem;
    line-height: 1.45;
  }

  .open {
    color: var(--accent);
    font-size: 1.3rem;
  }

  @media (max-width: 700px) {
    .entry-row {
      grid-template-columns: 88px 1fr 16px;
      gap: 10px;
    }

    .summary {
      grid-column: 2;
      margin-top: -3px;
    }

    .open {
      grid-row: 1 / 3;
      grid-column: 3;
    }
  }

  @media (max-width: 430px) {
    .entry-row {
      grid-template-columns: 1fr 16px;
      padding-inline: 8px;
    }

    .kind {
      grid-column: 1;
    }

    .term,
    .summary {
      grid-column: 1;
    }

    .open {
      grid-row: 1 / 4;
      grid-column: 2;
    }
  }
</style>
