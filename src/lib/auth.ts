import { writable } from 'svelte/store'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseAnonKey, joinOwnerUrl } from './supabase'

export type AuthState = {
  ready: boolean
  session: Session | null
  isAdmin: boolean
}

export const auth = writable<AuthState>({ ready: false, session: null, isAdmin: false })

async function checkIsAdmin(session: Session | null): Promise<boolean> {
  if (!session) return false
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (error) {
    console.error('admin check failed', error)
    return false
  }
  return data !== null
}

supabase.auth.onAuthStateChange((_event, session) => {
  (async () => {
    const isAdmin = await checkIsAdmin(session)
    auth.set({ ready: true, session, isAdmin })
  })()
})

export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? 'Email or password is not right. Please try again.' : null
}

export async function joinAsOwner(
  email: string,
  password: string,
  inviteCode: string,
): Promise<string | null> {
  const response = await fetch(joinOwnerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
      Apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ email, password, inviteCode }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok) {
    return typeof result?.error === 'string'
      ? result.error
      : 'Something went wrong. Please try again.'
  }
  return signIn(email, password)
}

export async function signOut() {
  await supabase.auth.signOut()
}
