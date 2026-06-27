// Arclo — Supabase auth
// This file handles all authentication for Arclo

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = '__SUPABASE_URL__'
const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign up a new player
export async function signUp({ email, password, username, region, game }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, region, game }
    }
  })
  if (error) throw error
  return data
}

// Log in an existing player
export async function logIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Log out
export async function logOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  window.location.href = '/index.html'
}

// Get current session
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// Get current player profile
export async function getPlayer() {
  const session = await getSession()
  if (!session) return null
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', session.user.id)
    .single()
  if (error) throw error
  return data
}

// Get leaderboard for a division and region
export async function getLeaderboard({ division = 'gold', region = 'oce' }) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('division', division)
    .eq('region', region)
    .order('points', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

// Get upcoming matches for a region
export async function getMatches({ region = 'oce', status = 'scheduled' }) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      player_one:player_one_id(username, division, points),
      player_two:player_two_id(username, division, points)
    `)
    .eq('region', region)
    .eq('status', status)
    .order('scheduled_at', { ascending: true })
    .limit(10)
  if (error) throw error
  return data
}

// Redirect to dashboard if already logged in
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    window.location.href = '/pages/login.html'
    return null
  }
  return session
}

// Redirect to dashboard if already logged in
export async function redirectIfLoggedIn() {
  const session = await getSession()
  if (session) window.location.href = '/pages/dashboard.html'
}
