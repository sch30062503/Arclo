import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = https://vuhvzgayhqaxbvrfpxzs.supabase.co
const SUPABASE_ANON_KEY = sb_publishable_prYuK2phkUR7OwyEhjming_KQNbwbOC

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function signUp({ email, password, username, region, game }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { username, region, game } }
  })
  if (error) throw error
  return data
}

export async function logIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logOut() {
  await supabase.auth.signOut()
  window.location.href = '/index.html'
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getPlayer() {
  const session = await getSession()
  if (!session) return null
  const { data, error } = await supabase.from('players').select('*').eq('id', session.user.id).single()
  if (error) throw error
  return data
}

export async function redirectIfLoggedIn() {
  const session = await getSession()
  if (session) window.location.href = '/pages/dashboard.html'
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) { window.location.href = '/pages/login.html'; return null }
  return session
}