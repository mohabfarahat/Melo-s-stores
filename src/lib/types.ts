export type Product = {
  id: string
  name: string
  description: string
  price_cents: number
  image_url: string | null
  category: ProductCategory
  color_family: ColorFamily
}

export const PRODUCT_CATEGORIES = ['Cardholders'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const COLOR_FAMILIES = ['Rich Brown', 'Stone Grey', 'Black'] as const
export type ColorFamily = (typeof COLOR_FAMILIES)[number]

export type AdminProduct = Product & {
  active: boolean
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled']

export type OrderItem = {
  product_name: string
  unit_price_cents: number
  quantity: number
}

export type AdminOrder = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  status: OrderStatus
  total_cents: number
  created_at: string
  order_items: OrderItem[]
}

export type CartLine = {
  productId: string
  name: string
  priceCents: number
  imageUrl: string | null
  quantity: number
}
