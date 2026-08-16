// components/backup-tools.tsx
'use client'

import { ChangeEvent, useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { importCheatsheets } from '@/app/actions/backup'

type BackupCard = {
  id: string
  title: string
  category: string
  content: string
  tags: string[] | null
  is_favorite: boolean
}

type Props = { cards: BackupCard[] }

export function BackupTools({ cards }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')

  function exportBackup() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      cheatsheets: cards.map(({ title, category, content, tags, is_favorite }) => ({
        title,
        category,
        content,
        tags: tags ?? [],
        is_favorite,
      })),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cheatsheet-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage(`${cards.length} catatan diekspor.`)
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setPending(true)
    setMessage('')
    const result = await importCheatsheets(await file.text())
    setPending(false)
    setMessage(result.error ?? result.success ?? '')

    if (result.success) window.location.reload()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={exportBackup} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-300">
        <Download className="h-4 w-4" /> Export JSON
      </button>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={pending} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50">
        <Upload className="h-4 w-4" /> {pending ? 'Mengimpor...' : 'Import JSON'}
      </button>
      <input ref={inputRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
      {message && <span className="text-xs text-slate-400">{message}</span>}
    </div>
  )
}
