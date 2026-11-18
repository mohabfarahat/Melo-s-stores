const formatter = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 })

export function formatPrice(cents: number): string {
  return formatter.format(cents / 100)
}
