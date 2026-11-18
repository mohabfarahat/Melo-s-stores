<script lang="ts">
  import { cartCount, cartOpen } from '../cart'
  import { PRODUCT_CATEGORIES } from '../types'
  import { route } from '../router'

  const navLinks = [
    { label: 'Shop All', href: '#/', active: (r: typeof $route) => r.name === 'shop' && r.category === null },
    ...PRODUCT_CATEGORIES.map((category) => ({
      label: category,
      href: `#/category/${encodeURIComponent(category)}`,
      active: (r: typeof $route) => r.name === 'shop' && r.category === category,
    })),
    { label: 'Our Story', href: '#/about', active: (r: typeof $route) => r.name === 'about' },
  ]
</script>

<header class="site-header">
  <div class="top-row">
    <a href="#/" class="brand">MELO'S FOR WOMEN</a>
    <div class="actions">
      <a href="#/admin" class="sign-in">Sign in</a>
      <button class="cart-button" on:click={() => cartOpen.set(true)} aria-label="Open cart">
        <span>Cart</span>
        {#if $cartCount > 0}
          <span class="badge">{$cartCount}</span>
        {/if}
      </button>
    </div>
  </div>
  <nav class="categories" aria-label="Shop categories">
    {#each navLinks as link (link.href)}
      <a href={link.href} class:active={link.active($route)} aria-current={link.active($route) ? 'page' : undefined}>
        {link.label}
      </a>
    {/each}
  </nav>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--color-paper);
    border-bottom: 1px solid var(--color-line);
  }
  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 24px;
  }
  .brand {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--color-ink);
    text-decoration: none;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .sign-in {
    color: var(--color-ink);
    font-size: 0.9rem;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 200ms;
  }
  .sign-in:hover {
    border-bottom-color: var(--color-ink);
  }
  .cart-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid var(--color-ink);
    border-radius: 999px;
    background: transparent;
    color: var(--color-ink);
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 200ms, color 200ms;
  }
  .cart-button:hover {
    background: var(--color-ink);
    color: var(--color-paper);
  }
  .badge {
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--color-ink);
    color: var(--color-paper);
    font-size: 0.8rem;
    line-height: 22px;
    text-align: center;
  }
  .categories {
    display: flex;
    justify-content: center;
    gap: 32px;
    padding: 0 24px 14px;
    overflow-x: auto;
    white-space: nowrap;
  }
  .categories a {
    padding-bottom: 4px;
    color: var(--color-muted);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 200ms, border-color 200ms;
  }
  .categories a:hover,
  .categories a.active {
    color: var(--color-ink);
    border-bottom-color: var(--color-ink);
  }
  @media (max-width: 640px) {
    .top-row {
      padding: 14px 16px;
    }
    .brand {
      font-size: 1.1rem;
      letter-spacing: 0.12em;
    }
    .actions {
      gap: 12px;
    }
  }
</style>
