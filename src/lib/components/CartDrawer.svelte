<script lang="ts">
  import { cart, cartOpen, cartSubtotalCents } from '../cart'
  import { formatPrice } from '../money'
  import { navigate } from '../router'

  function checkout() {
    cartOpen.set(false)
    navigate('/checkout')
  }

  function close() {
    cartOpen.set(false)
  }
</script>

{#if $cartOpen}
  <div class="backdrop" on:click={close} aria-hidden="true"></div>
  <aside class="drawer" aria-label="Shopping cart">
    <header>
      <h2>Your cart</h2>
      <button class="close" on:click={close} aria-label="Close cart">Close</button>
    </header>

    {#if $cart.length === 0}
      <p class="empty">Your cart is empty. Browse the shop to find a card holder you love.</p>
    {:else}
      <ul>
        {#each $cart as line (line.productId)}
          <li>
            {#if line.imageUrl}
              <img src={line.imageUrl} alt="" />
            {/if}
            <div class="info">
              <p class="name">{line.name}</p>
              <p class="price">{formatPrice(line.priceCents)}</p>
              <div class="quantity">
                <button on:click={() => cart.setQuantity(line.productId, line.quantity - 1)} aria-label="Decrease quantity">-</button>
                <span>{line.quantity}</span>
                <button on:click={() => cart.setQuantity(line.productId, line.quantity + 1)} aria-label="Increase quantity">+</button>
                <button class="remove" on:click={() => cart.remove(line.productId)}>Remove</button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
      <footer>
        <p class="subtotal">
          <span>Subtotal</span>
          <strong>{formatPrice($cartSubtotalCents)}</strong>
        </p>
        <button class="checkout" on:click={checkout}>Checkout</button>
      </footer>
    {/if}
  </aside>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 13, 13, 0.4);
    z-index: 20;
    animation: fade-in 200ms ease-out;
  }
  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(420px, 100%);
    z-index: 30;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    box-shadow: -8px 0 24px rgba(13, 13, 13, 0.2);
    animation: slide-in 250ms ease-out;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid #e6e4df;
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: #0d0d0d;
  }
  .close {
    border: none;
    background: none;
    color: #0d0d0d;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
  .empty {
    padding: 24px;
    color: #5c5852;
  }
  ul {
    flex: 1;
    overflow-y: auto;
    margin: 0;
    padding: 16px 24px;
    list-style: none;
  }
  li {
    display: flex;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #efede9;
  }
  li img {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 8px;
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .name,
  .price {
    margin: 0;
    color: #0d0d0d;
  }
  .price {
    color: #0d0d0d;
  }
  .quantity {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
  .quantity button {
    width: 32px;
    height: 32px;
    border: 1px solid #bdb8af;
    border-radius: 6px;
    background: #ffffff;
    color: #0d0d0d;
    cursor: pointer;
    transition: background 200ms;
  }
  .quantity button:hover {
    background: #f3f2ef;
  }
  .quantity .remove {
    width: auto;
    margin-left: 8px;
    padding: 0 8px;
    border: none;
    background: none;
    color: #9b2c2c;
    text-decoration: underline;
  }
  footer {
    padding: 24px;
    border-top: 1px solid #e6e4df;
  }
  .subtotal {
    display: flex;
    justify-content: space-between;
    margin: 0 0 16px;
    color: #0d0d0d;
  }
  .checkout {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 8px;
    background: #0d0d0d;
    color: #ffffff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background 200ms;
  }
  .checkout:hover {
    background: #262626;
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-in {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
</style>
