<section class="banner">
  <div class="copy">
    <p class="eyebrow">Already ordered?</p>
    <h2>Follow your order from start to finish.</h2>
  </div>
  <div class="actions">
    <a class="primary" href="#/track">Track your order</a>
    <a class="secondary" href="#/admin">Sign in</a>
  </div>
</section>

<style>
  .banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 32px 40px;
    background: var(--color-ink);
    color: var(--color-paper);
  }
  .eyebrow {
    margin: 0 0 8px;
    color: #d6d2ca;
    font-size: 0.75rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 500;
    line-height: 1.2;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .actions a {
    padding: 12px 22px;
    border: 1px solid var(--color-paper);
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 200ms, color 200ms;
  }
  .primary {
    background: var(--color-paper);
    color: var(--color-ink);
  }
  .primary:hover {
    background: transparent;
    color: var(--color-paper);
  }
  .secondary {
    color: var(--color-paper);
  }
  .secondary:hover {
    background: var(--color-paper);
    color: var(--color-ink);
  }
  @media (max-width: 640px) {
    .banner {
      padding: 24px 20px;
    }
  }
</style>
