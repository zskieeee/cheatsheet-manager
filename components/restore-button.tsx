// components/restore-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RestoreButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function restore() {
    setPending(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('cheatsheets')
      .update({ is_archived: false })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.refresh()
    }

    setPending(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={restore}
        disabled={pending}
        className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
      >
        {pending ? 'Memulihkan...' : 'Restore'}
      </button>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  )
}
