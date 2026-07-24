<footer>
  <div class="shell footer-inner">
    <div>
      <strong>Slovak Atlas</strong>
      <p>Slovak reference and lessons for English speakers.</p>
    </div>
    <div class="links">
      <a href="/wiki">Browse the wiki</a>
      <a href="/learn">Start learning</a>
      <a href="https://slovnik.juls.savba.sk/">Language sources</a>
    </div>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--line);
    background: #f0f1ef;
    color: var(--ink);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    gap: 32px;
    padding-block: 44px;
  }

  strong {
    font-size: 1rem;
  }

  p {
    margin: 8px 0 0;
    color: var(--muted);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 24px;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .links a:hover {
    color: var(--ink);
    text-decoration: underline;
  }

  @media (max-width: 680px) {
    .footer-inner,
    .links {
      align-items: start;
      flex-direction: column;
    }
  }
</style>
