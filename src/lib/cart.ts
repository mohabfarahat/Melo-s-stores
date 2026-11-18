import { writable, derived } from 'svelte/store'
import type { CartLine, Product } from './types'

const STORAGE_KEY = 'melos-cart'
const MAX_QUANTITY = 10

function loadInitialCart(): CartLine[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? (parsed as CartLine[]) : []
  } catch {
    return []
  }
}

const cartLines = writable<CartLine[]>(loadInitialCart())

cartLines.subscribe((lines) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
})

export const cart = {
  subscribe: cartLines.subscribe,

  add(product: Product, quantity: number) {
    cartLines.update((lines) => {
      const existing = lines.find((line) => line.productId === product.id)
      if (existing) {
        return lines.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: Math.min(line.quantity + quantity, MAX_QUANTITY) }
            : line,
        )
      }
      return [
        ...lines,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.price_cents,
          imageUrl: product.image_url,
          quantity: Math.min(quantity, MAX_QUANTITY),
        },
      ]
    })
  },

  setQuantity(productId: string, quantity: number) {
    cartLines.update((lines) =>
      quantity < 1
        ? lines.filter((line) => line.productId !== productId)
        : lines.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) }
              : line,
          ),
    )
  },

  remove(productId: string) {
    cartLines.update((lines) => lines.filter((line) => line.productId !== productId))
  },

  clear() {
    cartLines.set([])
  },
}

export const cartCount = derived(cartLines, (lines) =>
  lines.reduce((sum, line) => sum + line.quantity, 0),
)

export const cartSubtotalCents = derived(cartLines, (lines) =>
  lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0),
)

export const cartOpen = writable(false)
