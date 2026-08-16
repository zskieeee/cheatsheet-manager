// components/google-sign-in-button.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false)

  async function signInWithGoogle() {
    setPending(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      setPending(false)
      window.alert(error.message)
    }
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900">G</span>
      {pending ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
    </button>
  )
}
