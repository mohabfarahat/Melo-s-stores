<script lang="ts">
  import { formatPrice } from '../lib/money'
  import { trackOrderUrl, supabaseAnonKey } from '../lib/supabase'

  type TrackedOrder = {
    reference: string
    status: 'pending' | 'paid' | 'shipped' | 'cancelled'
    totalCents: number
    createdAt: string
    items: { product_name: string; unit_price_cents: number; quantity: number }[]
  }

  const statusLabels: Record<TrackedOrder['status'], string> = {
    pending: 'Received',
    paid: 'Payment confirmed',
    shipped: 'Shipped',
    cancelled: 'Cancelled',
  }

  let reference = ''
  let email = ''
  let searching = false
  let errorMessage = ''
  let order: TrackedOrder | null = null

  async function findOrder() {
    searching = true
    errorMessage = ''
    order = null
    try {
      const response = await fetch(trackOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          Apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ reference, email }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || typeof result?.status !== 'string') {
        errorMessage = result?.error ?? 'We could not look up your order. Please try again.'
        return
      }
      order = result as TrackedOrder
    } catch {
      errorMessage = 'Network problem. Check your connection and try again.'
    } finally {
      searching = false
    }
  }
</script>

<section class="track">
  <p class="eyebrow">Track your order</p>
  <h1>Where is my order?</h1>
  <p class="lead">Enter the reference from your confirmation and the email you ordered with.</p>

  <form on:submit|preventDefault={findOrder}>
    <label>
      Order reference
      <input type="text" bind:value={reference} maxlength="8" placeholder="e.g. 3F9A1C2B" required autocomplete="off" />
    </label>
    <label>
      Email
      <input type="email" bind:value={email} maxlength="254" required autocomplete="email" />
    </label>
    <button type="submit" disabled={searching}>{searching ? 'Searching...' : 'Find my order'}</button>
  </form>

  {#if errorMessage}
    <p class="error" role="alert">{errorMessage}</p>
  {/if}

  {#if order}
    <div class="result" aria-live="polite">
      <p class="status-label">{statusLabels[order.status]}</p>
      <p class="reference">Order {order.reference}</p>
      <ul>
        {#each order.items as item}
          <li>
            <span>{item.product_name} &times; {item.quantity}</span>
            <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
          </li>
        {/each}
      </ul>
      <p class="total">
        <span>Total</span>
        <span>{formatPrice(order.totalCents)}</span>
      </p>
    </div>
  {/if}
</section>

<style>
  .track {
    max-width: 560px;
    margin: 0 auto;
    padding: 72px 24px 96px;
  }
  .eyebrow {
    margin: 0 0 12px;
    color: var(--color-muted);
    font-size: 0.75rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    text-align: center;
  }
  h1 {
    margin: 0 0 12px;
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 2.75rem);
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
  }
  .lead {
    margin: 0 0 40px;
    color: var(--color-muted);
    text-align: center;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--color-ink);
    font-size: 0.85rem;
  }
  input {
    padding: 12px 14px;
    border: 1px solid var(--color-line);
    border-radius: 0;
    font: inherit;
    color: var(--color-ink);
    background: var(--color-paper);
  }
  input:focus {
    outline: 2px solid var(--color-ink);
    outline-offset: 1px;
  }
  button {
    padding: 14px 24px;
    border: 1px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-paper);
    font: inherit;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms, color 200ms;
  }
  button:hover:not(:disabled) {
    background: var(--color-paper);
    color: var(--color-ink);
  }
  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  .error {
    margin: 24px 0 0;
    color: #8a1f1f;
    text-align: center;
  }
  .result {
    margin-top: 40px;
    padding: 24px;
    border: 1px solid var(--color-line);
    animation: rise 300ms ease-out;
  }
  .status-label {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.5rem;
  }
  .reference {
    margin: 4px 0 20px;
    color: var(--color-muted);
    font-size: 0.85rem;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li,
  .total {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid var(--color-line);
    margin: 0;
  }
  .total {
    font-weight: 500;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
