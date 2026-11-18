<script lang="ts">
  import { supabase } from '../lib/supabase'
  import type { Product } from '../lib/types'
  import { cart, cartOpen } from '../lib/cart'
  import { formatPrice } from '../lib/money'
  import { navigate } from '../lib/router'

  export let productId: string

  const quantityOptions = Array.from({ length: 10 }, (_, index) => index + 1)

  let product: Product | null = null
  let loading = true
  let errorMessage = ''
  let quantity = 1

  $: if (productId) loadProduct()

  async function loadProduct() {
    loading = true
    errorMessage = ''
    product = null
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price_cents, image_url')
      .eq('id', productId)
      .maybeSingle()
    loading = false
    if (error) {
      errorMessage = "We couldn't load this product. Please try again."
      return
    }
    product = (data as Product | null) ?? null
  }

  function addToCart() {
    if (!product) return
    cart.add(product, quantity)
    cartOpen.set(true)
  }
</script>

<section class="product-page">
  <a class="back" href="#/">Back to the collection</a>

  {#if loading}
    <p class="status">Loading product...</p>
  {:else if errorMessage}
    <p class="status error">{errorMessage}</p>
  {:else if !product}
    <div class="status">
      <p>We couldn't find that product.</p>
      <button on:click={() => navigate('/')}>See the collection</button>
    </div>
  {:else}
    <div class="layout">
      <div class="photo">
        {#if product.image_url}
          <img src={product.image_url} alt={product.name} />
        {/if}
      </div>
      <div class="info">
        <h1>{product.name}</h1>
        <p class="price">{formatPrice(product.price_cents)}</p>
        <p class="description">{product.description}</p>

        <div class="purchase">
          <label>
            Quantity
            <select bind:value={quantity}>
              {#each quantityOptions as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </label>
          <button class="add-button" on:click={addToCart}>Add to cart</button>
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  .product-page {
    max-width: 1040px;
    margin: 0 auto;
    padding: 32px 24px 64px;
  }
  .back {
    color: #0d0d0d;
  }
  .layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    margin-top: 24px;
  }
  @media (min-width: 768px) {
    .layout {
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }
  }
  .photo img {
    width: 100%;
    border-radius: 16px;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    background: #f3f2ef;
  }
  h1 {
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 3vw, 2.25rem);
    line-height: 1.2;
    color: #0d0d0d;
  }
  .price {
    margin: 0 0 16px;
    color: #0d0d0d;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .description {
    margin: 0 0 32px;
    color: #5c5852;
    line-height: 1.5;
  }
  .purchase {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 16px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #0d0d0d;
  }
  select {
    padding: 10px 12px;
    border: 1px solid #bdb8af;
    border-radius: 8px;
    background: #ffffff;
    font: inherit;
  }
  .add-button {
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    background: #0d0d0d;
    color: #ffffff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background 200ms;
  }
  .add-button:hover {
    background: #333333;
  }
  .status {
    margin-top: 32px;
    text-align: center;
    color: #5c5852;
  }
  .status.error {
    color: #9b2c2c;
  }
  .status button {
    margin-top: 12px;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background: #0d0d0d;
    color: #ffffff;
    font: inherit;
    cursor: pointer;
  }
</style>
