import { supabase, getSession } from './auth.js'

export async function initNav() {
  const session = await getSession()
  const actionsEl = document.getElementById('nav-actions')
  if (!actionsEl) return

  if (session) {
    actionsEl.innerHTML = `
      <a href="dashboard.html" class="btn btn-secondary btn-sm">Dashboard</a>
      <button onclick="navLogout()" class="btn btn-ghost btn-sm">Log out</button>
    `
    window.navLogout = async function() {
      await supabase.auth.signOut()
      window.location.href = '../index.html'
    }
  } else {
    actionsEl.innerHTML = `
      <a href="login.html" class="btn btn-ghost btn-sm">Log in</a>
      <a href="signup.html" class="btn btn-primary btn-sm">Join free</a>
    `
  }
}
