<footer>
  <div class="footer-inner">
    <div>
      <strong>Slovak Atlas</strong>
      <p>Reference and lessons for English speakers.</p>
    </div>
    <nav aria-label="Footer navigation">
      <a href="/wiki">Reference index</a>
      <a href="/learn">Beginner lessons</a>
      <a href="https://slovnik.juls.savba.sk/">Language sources ↗</a>
    </nav>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--line);
    background: color-mix(in srgb, var(--surface-subtle) 62%, transparent);
  }

  .footer-inner {
    display: flex;
    width: calc(100% - 48px);
    justify-content: space-between;
    gap: 28px;
    margin-inline: auto;
    padding-block: 20px;
  }

  strong {
    font-family: var(--font-reading);
    font-size: 0.9rem;
  }

  p {
    margin: 3px 0 0;
    color: var(--muted);
    font-size: 0.7rem;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 20px;
    color: var(--muted);
    font-size: 0.74rem;
  }

  nav a:hover {
    color: var(--accent-dark);
    text-decoration: underline;
  }

  @media (max-width: 680px) {
    .footer-inner,
    nav {
      align-items: start;
      flex-direction: column;
    }

    .footer-inner {
      width: calc(100% - 28px);
    }
  }
</style>
