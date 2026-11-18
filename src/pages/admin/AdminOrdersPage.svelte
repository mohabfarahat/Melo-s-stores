<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '../../lib/supabase'
  import { formatPrice } from '../../lib/money'
  import { ORDER_STATUSES, type AdminOrder, type OrderStatus } from '../../lib/types'

  let orders: AdminOrder[] = []
  let loading = true
  let loadError = ''
  let actionError = ''

  onMount(loadOrders)

  async function loadOrders() {
    loading = true
    loadError = ''
    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, customer_name, customer_email, customer_phone, shipping_address, status, total_cents, created_at, order_items(product_name, unit_price_cents, quantity)',
      )
      .order('created_at', { ascending: false })
    loading = false
    if (error || !Array.isArray(data)) {
      console.error('admin order load failed', error)
      loadError = "We couldn't load the orders. Please try again."
      return
    }
    orders = data as AdminOrder[]
  }

  function onStatusChange(order: AdminOrder, event: Event) {
    const status = (event.currentTarget as HTMLSelectElement).value as OrderStatus
    changeStatus(order, status)
  }

  async function changeStatus(order: AdminOrder, status: OrderStatus) {
    actionError = ''
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id)
    if (error) {
      console.error('order status update failed', error)
      actionError = 'We could not update that order. Please try again.'
      return
    }
    orders = orders.map((item) => (item.id === order.id ? { ...item, status } : item))
  }

  function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
</script>

<section class="orders">
  <h1>Orders</h1>

  {#if actionError}
    <p class="error" role="alert">{actionError}</p>
  {/if}

  {#if loading}
    <p class="status">Loading orders...</p>
  {:else if loadError}
    <div class="status error">
      <p>{loadError}</p>
      <button class="secondary" on:click={loadOrders}>Try again</button>
    </div>
  {:else if orders.length === 0}
    <p class="status">No orders yet.</p>
  {:else}
    <ul class="list">
      {#each orders as order (order.id)}
        <li>
          <header>
            <div>
              <p class="reference">Order {order.id.slice(0, 8).toUpperCase()}</p>
              <p class="meta">{formatDate(order.created_at)} &middot; {formatPrice(order.total_cents)}</p>
            </div>
            <label>
              Status
              <select value={order.status} on:change={(event) => onStatusChange(order, event)}>
                {#each ORDER_STATUSES as status}
                  <option value={status}>{status}</option>
                {/each}
              </select>
            </label>
          </header>

          <div class="columns">
            <div>
              <p class="label">Customer</p>
              <p>{order.customer_name}</p>
              <p>{order.customer_email}</p>
              {#if order.customer_phone}
                <p>{order.customer_phone}</p>
              {/if}
            </div>
            <div>
              <p class="label">Ship to</p>
              <p class="address">{order.shipping_address}</p>
            </div>
          </div>

          <ul class="items">
            {#each order.order_items as item}
              <li>
                <span>{item.product_name} x {item.quantity}</span>
                <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .orders {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px 64px;
    color: #0d0d0d;
  }
  h1 {
    margin: 0 0 24px;
    font-family: var(--font-display);
    font-size: 1.75rem;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .list > li {
    padding: 20px;
    background: #ffffff;
    border: 1px solid #e6e4df;
    border-radius: 12px;
  }
  .list > li > header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }
  .reference,
  .meta,
  .label {
    margin: 0;
  }
  .reference {
    font-weight: 600;
  }
  .meta,
  .label {
    color: #5c5852;
    font-size: 0.9rem;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.9rem;
  }
  select {
    padding: 8px 12px;
    border: 1px solid #bdb8af;
    border-radius: 8px;
    background: #ffffff;
    font: inherit;
  }
  .columns {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  @media (min-width: 640px) {
    .columns {
      grid-template-columns: 1fr 1fr;
    }
  }
  .columns p {
    margin: 0 0 4px;
  }
  .address {
    white-space: pre-line;
  }
  .items {
    margin: 0;
    padding: 12px 0 0;
    border-top: 1px solid #efede9;
    list-style: none;
  }
  .items li {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 4px 0;
  }
  .status {
    text-align: center;
    color: #5c5852;
  }
  .error {
    color: #9b2c2c;
  }
  .status.error button {
    margin-top: 8px;
    padding: 8px 14px;
    border: 1px solid #0d0d0d;
    border-radius: 8px;
    background: transparent;
    font: inherit;
    cursor: pointer;
  }
</style>
