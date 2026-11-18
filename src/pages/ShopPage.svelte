<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '../lib/supabase'
  import { route } from '../lib/router'
  import { COLOR_FAMILIES, type ColorFamily, type Product } from '../lib/types'
  import ProductCard from '../lib/components/ProductCard.svelte'
  import ShopBanner from '../lib/components/ShopBanner.svelte'

  type SortKey = 'newest' | 'price-asc' | 'price-desc'

  const sortLabels: Record<SortKey, string> = {
    newest: 'Newest',
    'price-asc': 'Price: low to high',
    'price-desc': 'Price: high to low',
  }

  let products: Product[] = []
  let loading = true
  let errorMessage = ''
  let colorFilter: ColorFamily | null = null
  let sortKey: SortKey = 'newest'

  $: category = $route.name === 'shop' ? $route.category : null
  $: title = category ?? 'The Collection'
  $: visible = products
    .filter((product) => (category ? product.category === category : true))
    .filter((product) => (colorFilter ? product.color_family === colorFilter : true))
    .sort(compareProducts)

  onMount(loadProducts)

  function compareProducts(a: Product, b: Product): number {
    if (sortKey === 'price-asc') return a.price_cents - b.price_cents
    if (sortKey === 'price-desc') return b.price_cents - a.price_cents
    return 0
  }

  async function loadProducts() {
    loading = true
    errorMessage = ''
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price_cents, image_url, category, color_family')
      .order('created_at', { ascending: false })
    loading = false
    if (error || !Array.isArray(data)) {
      errorMessage = "We couldn't load the collection right now. Please try again."
      return
    }
    products = data as Product[]
  }
</script>

<ShopBanner />

<section class="shop">
  <header class="intro">
    <p class="eyebrow">Melo's for Women</p>
    <h1>{title}</h1>
  </header>

  <div class="toolbar">
    <div class="chips" role="group" aria-label="Filter by color family">
      <button class="chip" class:selected={colorFilter === null} on:click={() => (colorFilter = null)}>
        All colors
      </button>
      {#each COLOR_FAMILIES as family}
        <button
          class="chip"
          class:selected={colorFilter === family}
          aria-pressed={colorFilter === family}
          on:click={() => (colorFilter = family)}
        >
          {family}
        </button>
      {/each}
    </div>
    <label class="sort">
      <span>Sort</span>
      <select bind:value={sortKey}>
        {#each Object.entries(sortLabels) as [key, label]}
          <option value={key}>{label}</option>
        {/each}
      </select>
    </label>
  </div>

  {#if loading}
    <p class="status">Loading the collection...</p>
  {:else if errorMessage}
    <div class="status error">
      <p>{errorMessage}</p>
      <button on:click={loadProducts}>Try again</button>
    </div>
  {:else if visible.length === 0}
    <p class="status">No pieces match these filters yet.</p>
  {:else}
    <div class="grid">
      {#each visible as product (product.id)}
        <ProductCard {product} />
      {/each}
    </div>
  {/if}
</section>

<style>
  .shop {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px 96px;
  }
  .intro {
    margin: 56px 0 40px;
    text-align: center;
  }
  .eyebrow {
    margin: 0 0 12px;
    color: var(--color-muted);
    font-size: 0.75rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }
  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.25rem, 5vw, 3.5rem);
    font-weight: 500;
    line-height: 1.2;
    color: var(--color-ink);
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 40px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-line);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    padding: 8px 16px;
    border: 1px solid var(--color-line);
    border-radius: 999px;
    background: var(--color-paper);
    color: var(--color-ink);
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 200ms, color 200ms, border-color 200ms;
  }
  .chip:hover {
    border-color: var(--color-ink);
  }
  .chip.selected {
    background: var(--color-ink);
    border-color: var(--color-ink);
    color: var(--color-paper);
  }
  .sort {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--color-muted);
    font-size: 0.85rem;
  }
  .sort select {
    padding: 8px 12px;
    border: 1px solid var(--color-line);
    border-radius: 8px;
    background: var(--color-paper);
    color: var(--color-ink);
    font: inherit;
    cursor: pointer;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 40px 24px;
  }
  .status {
    text-align: center;
    color: var(--color-muted);
  }
  .error button {
    margin-top: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 999px;
    background: var(--color-ink);
    color: var(--color-paper);
    font: inherit;
    cursor: pointer;
  }
  @media (max-width: 640px) {
    .shop {
      padding: 0 16px 72px;
    }
    .grid {
      gap: 32px 16px;
    }
  }
</style>
