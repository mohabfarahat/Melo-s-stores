<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { supabase } from '../../supabase'
  import { COLOR_FAMILIES, PRODUCT_CATEGORIES, type AdminProduct, type ColorFamily, type ProductCategory } from '../../types'

  export let product: AdminProduct | null = null

  const dispatch = createEventDispatcher<{ saved: void; close: void }>()

  let name = product?.name ?? ''
  let description = product?.description ?? ''
  let priceText = product ? (product.price_cents / 100).toFixed(2) : ''
  let category: ProductCategory = product?.category ?? PRODUCT_CATEGORIES[0]
  let colorFamily: ColorFamily = product?.color_family ?? COLOR_FAMILIES[0]
  let imageUrl = product?.image_url ?? ''
  let active = product?.active ?? true
  let saving = false
  let errorMessage = ''

  async function save() {
    const trimmedName = name.trim()
    const price = Number(priceText)
    if (!trimmedName) {
      errorMessage = 'Please enter a name for this product.'
      return
    }
    if (!priceText.trim() || !Number.isFinite(price) || price < 0 || price > 100000) {
      errorMessage = 'Please enter a price between 0 and 100000.'
      return
    }
    const trimmedImage = imageUrl.trim()
    if (trimmedImage && !trimmedImage.startsWith('https://')) {
      errorMessage = 'The photo link must start with https://'
      return
    }

    const values = {
      name: trimmedName.slice(0, 120),
      description: description.trim().slice(0, 2000),
      price_cents: Math.round(price * 100),
      image_url: trimmedImage || null,
      category,
      color_family: colorFamily,
      active,
    }

    saving = true
    errorMessage = ''
    const result = product
      ? await supabase.from('products').update(values).eq('id', product.id)
      : await supabase.from('products').insert(values)
    saving = false

    if (result.error) {
      console.error('product save failed', result.error)
      errorMessage = 'We could not save this product. Please try again.'
      return
    }
    dispatch('saved')
  }
</script>

<div class="backdrop" on:click={() => dispatch('close')} aria-hidden="true"></div>
<div class="dialog" role="dialog" aria-modal="true" aria-label={product ? 'Edit product' : 'New product'}>
  <h2>{product ? 'Edit product' : 'New product'}</h2>

  <form on:submit|preventDefault={save}>
    <label>
      Name
      <input type="text" bind:value={name} required maxlength="120" />
    </label>
    <label>
      Description
      <textarea bind:value={description} rows="4" maxlength="2000"></textarea>
    </label>
    <label>
      Price (EGP)
      <input type="number" bind:value={priceText} min="0" max="100000" step="0.01" required />
    </label>
    <label>
      Category
      <select bind:value={category}>
        {#each PRODUCT_CATEGORIES as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>
    <label>
      Color family
      <select bind:value={colorFamily}>
        {#each COLOR_FAMILIES as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>
    <label>
      Photo link (optional, must start with https://)
      <input type="url" bind:value={imageUrl} maxlength="500" />
    </label>
    <label class="checkbox">
      <input type="checkbox" bind:checked={active} />
      Show this product in the shop
    </label>

    {#if errorMessage}
      <p class="error" role="alert">{errorMessage}</p>
    {/if}

    <div class="actions">
      <button type="button" class="secondary" on:click={() => dispatch('close')}>Cancel</button>
      <button type="submit" class="primary" disabled={saving}>
        {saving ? 'Saving...' : 'Save product'}
      </button>
    </div>
  </form>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 13, 13, 0.45);
    z-index: 40;
  }
  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(520px, calc(100% - 32px));
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    z-index: 50;
    padding: 24px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 24px 48px rgba(13, 13, 13, 0.25);
    color: #0d0d0d;
    animation: rise 200ms ease-out;
  }
  h2 {
    margin: 0 0 16px;
    font-family: var(--font-display);
    font-size: 1.5rem;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  label.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  input,
  select,
  textarea {
    padding: 10px 12px;
    border: 1px solid #bdb8af;
    border-radius: 8px;
    font: inherit;
  }
  input:focus,
  textarea:focus {
    outline: 2px solid #0d0d0d;
    outline-offset: 1px;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .primary,
  .secondary {
    padding: 10px 18px;
    border-radius: 8px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background 200ms;
  }
  .primary {
    border: none;
    background: #0d0d0d;
    color: #ffffff;
  }
  .primary:hover:not(:disabled) {
    background: #333333;
  }
  .primary:disabled {
    opacity: 0.7;
    cursor: wait;
  }
  .secondary {
    border: 1px solid #0d0d0d;
    background: transparent;
    color: #0d0d0d;
  }
  .secondary:hover {
    background: #f3f2ef;
  }
  .error {
    margin: 0;
    color: #9b2c2c;
  }
  @keyframes rise {
    from { opacity: 0; transform: translate(-50%, -46%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
</style>
