<script lang="ts">
  import type { Product } from '../types'
  import { cart, cartOpen } from '../cart'
  import { formatPrice } from '../money'
  import { navigate } from '../router'

  export let product: Product

  function addToCart() {
    cart.add(product, 1)
    cartOpen.set(true)
  }
</script>

<article class="card">
  <button class="image-link" on:click={() => navigate(`/product/${product.id}`)} aria-label={`View ${product.name}`}>
    {#if product.image_url}
      <img src={product.image_url} alt={product.name} loading="lazy" />
    {:else}
      <div class="placeholder" aria-hidden="true"></div>
    {/if}
  </button>
  <div class="details">
    <h3>
      <a href={`#/product/${product.id}`}>{product.name}</a>
    </h3>
    <p class="meta">{product.color_family}</p>
    <p class="price">{formatPrice(product.price_cents)}</p>
    <button class="add-button" on:click={addToCart}>Add to cart</button>
  </div>
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    background: var(--color-paper);
  }
  .image-link {
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    background: var(--color-stone);
    cursor: pointer;
    overflow: hidden;
  }
  img,
  .placeholder {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    background: var(--color-stone);
    transition: transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .image-link:hover img {
    transform: scale(1.04);
  }
  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 0 0;
  }
  h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 500;
    line-height: 1.2;
  }
  h3 a {
    color: var(--color-ink);
    text-decoration: none;
  }
  h3 a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .meta {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.85rem;
  }
  .price {
    margin: 0;
    color: var(--color-ink);
    font-size: 0.95rem;
  }
  .add-button {
    margin-top: 12px;
    padding: 12px 16px;
    border: 1px solid var(--color-ink);
    border-radius: 0;
    background: transparent;
    color: var(--color-ink);
    font: inherit;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms, color 200ms;
  }
  .add-button:hover {
    background: var(--color-ink);
    color: var(--color-paper);
  }
</style>
