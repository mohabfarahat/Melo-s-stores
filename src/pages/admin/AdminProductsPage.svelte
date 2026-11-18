<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '../../lib/supabase'
  import { formatPrice } from '../../lib/money'
  import type { AdminProduct } from '../../lib/types'
  import ProductForm from '../../lib/components/admin/ProductForm.svelte'

  let products: AdminProduct[] = []
  let loading = true
  let loadError = ''
  let actionError = ''
  let formOpen = false
  let editing: AdminProduct | null = null

  onMount(loadProducts)

  async function loadProducts() {
    loading = true
    loadError = ''
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price_cents, image_url, category, color_family, active')
      .order('created_at')
    loading = false
    if (error || !Array.isArray(data)) {
      console.error('admin product load failed', error)
      loadError = "We couldn't load the products. Please try again."
      return
    }
    products = data as AdminProduct[]
  }

  function openNew() {
    editing = null
    formOpen = true
  }

  function openEdit(product: AdminProduct) {
    editing = product
    formOpen = true
  }

  function closeForm() {
    formOpen = false
    editing = null
  }

  async function onSaved() {
    closeForm()
    await loadProducts()
  }

  async function toggleVisibility(product: AdminProduct) {
    actionError = ''
    const { error } = await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id)
    if (error) {
      console.error('product visibility update failed', error)
      actionError = 'We could not change that product. Please try again.'
      return
    }
    await loadProducts()
  }

  async function removeProduct(product: AdminProduct) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone. To hide it instead, use Hide.`)) return
    actionError = ''
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) {
      console.error('product delete failed', error)
      actionError = 'We could not delete that product. Please try again.'
      return
    }
    await loadProducts()
  }
</script>

<section class="products">
  <div class="header">
    <h1>Products</h1>
    <button class="primary" on:click={openNew}>Add product</button>
  </div>

  {#if actionError}
    <p class="error" role="alert">{actionError}</p>
  {/if}

  {#if loading}
    <p class="status">Loading products...</p>
  {:else if loadError}
    <div class="status error">
      <p>{loadError}</p>
      <button class="secondary" on:click={loadProducts}>Try again</button>
    </div>
  {:else if products.length === 0}
    <p class="status">No products yet. Use Add product to create your first one.</p>
  {:else}
    <ul class="list">
      {#each products as product (product.id)}
        <li class:hidden-product={!product.active}>
          <div class="thumb">
            {#if product.image_url}
              <img src={product.image_url} alt="" />
            {/if}
          </div>
          <div class="details">
            <p class="name">{product.name}</p>
            <p class="meta">
              {product.category} &middot; {product.color_family} &middot; {formatPrice(product.price_cents)} &middot; {product.active ? 'Visible in shop' : 'Hidden from shop'}
            </p>
          </div>
          <div class="actions">
            <button class="secondary" on:click={() => openEdit(product)}>Edit</button>
            <button class="secondary" on:click={() => toggleVisibility(product)}>
              {product.active ? 'Hide' : 'Show'}
            </button>
            <button class="danger" on:click={() => removeProduct(product)}>Delete</button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

{#if formOpen}
  <ProductForm product={editing} on:saved={onSaved} on:close={closeForm} />
{/if}

<style>
  .products {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px 64px;
    color: #0d0d0d;
  }
  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.75rem;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #ffffff;
    border: 1px solid #e6e4df;
    border-radius: 12px;
  }
  li.hidden-product {
    opacity: 0.7;
  }
  .thumb {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    border-radius: 8px;
    background: #f3f2ef;
    overflow: hidden;
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .details {
    flex: 1;
    min-width: 160px;
  }
  .name,
  .meta {
    margin: 0;
  }
  .name {
    font-weight: 600;
  }
  .meta {
    color: #5c5852;
    font-size: 0.9rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .primary,
  .secondary,
  .danger {
    padding: 8px 14px;
    border-radius: 8px;
    font: inherit;
    cursor: pointer;
    transition: background 200ms, color 200ms;
  }
  .primary {
    border: none;
    background: #0d0d0d;
    color: #ffffff;
    font-weight: 600;
    padding: 10px 18px;
  }
  .primary:hover {
    background: #333333;
  }
  .secondary {
    border: 1px solid #0d0d0d;
    background: transparent;
    color: #0d0d0d;
  }
  .secondary:hover {
    background: #f3f2ef;
  }
  .danger {
    border: 1px solid #9b2c2c;
    background: transparent;
    color: #9b2c2c;
  }
  .danger:hover {
    background: #9b2c2c;
    color: #ffffff;
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
  }
</style>
