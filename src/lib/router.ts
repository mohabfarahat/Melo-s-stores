import { readable } from 'svelte/store'
import { PRODUCT_CATEGORIES, type ProductCategory } from './types'

export type Route =
  | { name: 'shop'; category: ProductCategory | null }
  | { name: 'product'; id: string }
  | { name: 'checkout' }
  | { name: 'confirmation'; orderId: string }
  | { name: 'about' }
  | { name: 'track' }
  | { name: 'admin'; section: 'products' | 'orders' }
  | { name: 'not-found' }

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseCategory(value: string | undefined): ProductCategory | null {
  const match = PRODUCT_CATEGORIES.find((category) => category === value)
  return match ?? null
}

function parseHash(hash: string): Route {
  const parts = hash.replace(/^#/, '').split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'shop', category: null }
  if (parts[0] === 'category') {
    return { name: 'shop', category: parseCategory(safeDecode(parts[1] ?? '')) }
  }
  if (parts[0] === 'product' && parts[1]) return { name: 'product', id: parts[1] }
  if (parts[0] === 'checkout') return { name: 'checkout' }
  if (parts[0] === 'order' && parts[1]) return { name: 'confirmation', orderId: parts[1] }
  if (parts[0] === 'about') return { name: 'about' }
  if (parts[0] === 'track') return { name: 'track' }
  if (parts[0] === 'admin') {
    return { name: 'admin', section: parts[1] === 'orders' ? 'orders' : 'products' }
  }
  return { name: 'not-found' }
}

export const route = readable<Route>(parseHash(window.location.hash), (set) => {
  const onChange = () => {
    set(parseHash(window.location.hash))
    window.scrollTo({ top: 0 })
  }
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
})

export function navigate(path: string) {
  window.location.hash = path
}
