<footer>
  <div class="shell footer-inner">
    <div>
      <strong>Slovak Atlas</strong>
      <p>Slovak reference and lessons for English speakers.</p>
    </div>
    <nav aria-label="Footer navigation">
      <a href="/wiki">Reference index</a>
      <a href="/learn">Beginner lessons</a>
      <a href="https://slovnik.juls.savba.sk/">Language sources</a>
    </nav>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--line);
    background: var(--surface-subtle);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    gap: 28px;
    padding-block: 24px;
  }

  strong {
    font-size: 0.9rem;
  }

  p {
    margin: 5px 0 0;
    color: var(--muted);
    font-size: 0.78rem;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 22px;
    color: var(--muted);
    font-size: 0.8rem;
  }

  nav a:hover {
    color: var(--blue);
    text-decoration: underline;
  }

  @media (max-width: 680px) {
    .footer-inner,
    nav {
      align-items: start;
      flex-direction: column;
    }
  }
</style>
