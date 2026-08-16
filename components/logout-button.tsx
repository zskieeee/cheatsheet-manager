'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-50"
    >
      {pending ? 'Keluar...' : 'Keluar'}
    </button>
  )
}
