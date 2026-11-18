import { createClient } from '@supabase/supabase-js'

export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const placeOrderUrl = `${supabaseUrl}/functions/v1/place-order`
export const joinOwnerUrl = `${supabaseUrl}/functions/v1/join-owner`
export const trackOrderUrl = `${supabaseUrl}/functions/v1/track-order`
