<script lang="ts">
  import { cart, cartSubtotalCents } from '../lib/cart'
  import { formatPrice } from '../lib/money'
  import { navigate } from '../lib/router'
  import { placeOrderUrl, supabaseAnonKey } from '../lib/supabase'

  let customerName = ''
  let customerEmail = ''
  let customerPhone = ''
  let shippingAddress = ''
  let submitting = false
  let errorMessage = ''

  async function submitOrder() {
    if ($cart.length === 0) {
      errorMessage = 'Your cart is empty. Add a card holder before placing your order.'
      return
    }
    submitting = true
    errorMessage = ''
    try {
      const response = await fetch(placeOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          Apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: shippingAddress,
          },
          items: $cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || typeof result?.orderId !== 'string') {
        errorMessage = result?.error ?? 'We could not place your order. Please try again.'
        return
      }
      cart.clear()
      navigate(`/order/${result.orderId}`)
    } catch {
      errorMessage = 'Network problem. Check your connection and try again.'
    } finally {
      submitting = false
    }
  }
</script>

<section class="checkout">
  <a class="back" href="#/">Continue shopping</a>
  <h1>Checkout</h1>

  {#if $cart.length === 0}
    <p class="empty">Your cart is empty. <a href="#/">Browse the collection</a>.</p>
  {:else}
    <div class="layout">
      <form on:submit|preventDefault={submitOrder}>
        <h2>Your details</h2>
        <label>
          Full name
          <input type="text" bind:value={customerName} required maxlength="100" autocomplete="name" />
        </label>
        <label>
          Email
          <input type="email" bind:value={customerEmail} required maxlength="254" autocomplete="email" />
        </label>
        <label>
          Phone (optional)
          <input type="tel" bind:value={customerPhone} maxlength="30" autocomplete="tel" />
        </label>
        <label>
          Shipping address
          <textarea bind:value={shippingAddress} required rows="3" maxlength="500" autocomplete="street-address"></textarea>
        </label>

        {#if errorMessage}
          <p class="error" role="alert">{errorMessage}</p>
        {/if}

        <button type="submit" class="place-order" disabled={submitting}>
          {submitting ? 'Placing your order...' : 'Place order'}
        </button>
      </form>

      <aside class="summary">
        <h2>Order summary</h2>
        <ul>
          {#each $cart as line (line.productId)}
            <li>
              <span>{line.name} x {line.quantity}</span>
              <span>{formatPrice(line.priceCents * line.quantity)}</span>
            </li>
          {/each}
        </ul>
        <p class="total">
          <span>Total</span>
          <strong>{formatPrice($cartSubtotalCents)}</strong>
        </p>
      </aside>
    </div>
  {/if}
</section>

<style>
  .checkout {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px 64px;
  }
  .back {
    color: #0d0d0d;
  }
  h1 {
    margin: 16px 0 24px;
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 3vw, 2.25rem);
    line-height: 1.2;
    color: #0d0d0d;
  }
  h2 {
    margin: 0 0 16px;
    font-size: 1.125rem;
    color: #0d0d0d;
  }
  .empty {
    color: #5c5852;
  }
  .layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
  }
  @media (min-width: 768px) {
    .layout {
      grid-template-columns: 3fr 2fr;
      align-items: start;
    }
  }
  form,
  .summary {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    background: #ffffff;
    border: 1px solid #e6e4df;
    border-radius: 16px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #0d0d0d;
  }
  input,
  textarea {
    padding: 10px 12px;
    border: 1px solid #bdb8af;
    border-radius: 8px;
    background: #ffffff;
    color: #0d0d0d;
    font: inherit;
  }
  input:focus,
  textarea:focus {
    outline: 2px solid #0d0d0d;
    outline-offset: 1px;
  }
  .error {
    margin: 0;
    color: #9b2c2c;
  }
  .place-order {
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
  .place-order:hover:not(:disabled) {
    background: #333333;
  }
  .place-order:disabled {
    opacity: 0.7;
    cursor: wait;
  }
  .summary ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .summary li {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0;
    border-bottom: 1px solid #efede9;
    color: #0d0d0d;
  }
  .total {
    display: flex;
    justify-content: space-between;
    margin: 0;
    color: #0d0d0d;
  }
</style>
