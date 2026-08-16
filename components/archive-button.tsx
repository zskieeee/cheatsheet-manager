'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ArchiveButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function archive() {
    if (!window.confirm('Arsipkan cheatsheet ini? Data tetap tersimpan di database.')) return

    setPending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    const { error } = await supabase
      .from('cheatsheets')
      .update({ is_archived: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      window.alert(error.message)
      setPending(false)
      return
    }

    router.refresh()
  }

  return <button type="button" onClick={archive} disabled={pending} className="rounded-md border border-red-400/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-400/10 disabled:opacity-50">{pending ? 'Mengarsipkan...' : 'Arsipkan'}</button>
}
