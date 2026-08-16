'use client'

import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Draft = {
  title: string
  category: string
  tags: string[]
  content: string
}

export function AiCheatsheetPanel() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageData, setImageData] = useState<{ data: string; mimeType: string } | null>(null)
  const [imagePending, setImagePending] = useState(false)
  const [imageError, setImageError] = useState('')

  async function generate() {
    setPending(true)
    setError('')
    setStatus('')
    setDraft(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'AI gagal membuat draft.')
      setDraft(data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'AI gagal membuat draft.')
    } finally {
      setPending(false)
    }
  }

  async function generateImage() {
    setImagePending(true)
    setImageError('')
    setImageData(null)

    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Gambar gagal dibuat.')
      setImageData(data.image)
    } catch (cause) {
      setImageError(cause instanceof Error && cause.message.includes('429') ? 'Gambar AI sedang terkena quota Gemini. Gunakan diagram Mermaid di dalam catatan atau aktifkan billing image nanti.' : cause instanceof Error ? cause.message : 'Gambar gagal dibuat.')
    } finally {
      setImagePending(false)
    }
  }

  function cancelDraft() {
    setDraft(null)
    setPrompt('')
    setError('')
    setStatus('')
  }

  async function saveDraft() {
    if (!draft) return
    setPending(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Sesi login tidak ditemukan.')
      setPending(false)
      return
    }

    const { error: insertError } = await supabase.from('cheatsheets').insert({
      user_id: user.id,
      title: draft.title,
      category: draft.category,
      tags: draft.tags,
      content: draft.content,
      is_archived: false,
      is_favorite: false,
    })

    if (insertError) setError(insertError.message)
    else {
      setStatus('Draft berhasil disimpan ke vault.')
      setDraft(null)
      setPrompt('')
      router.refresh()
    }
    setPending(false)
  }

  return (
    <section className="mb-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/[.05] p-6">
      <p className="text-xs font-bold tracking-[0.25em] text-cyan-400">AI NOTE MAKER</p>
      <h2 className="mt-2 text-xl font-bold text-white">Minta AI membuat cheatsheet</h2>
      <p className="mt-1 text-sm text-slate-400">Contoh: “Buat cheatsheet Docker cleanup untuk pemula.”</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} maxLength={2000} placeholder="Tulis instruksi teknis kamu..." className="min-h-24 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400" />
        <button type="button" onClick={generate} disabled={pending || prompt.trim().length < 5} className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{pending ? 'Membuat...' : 'Buat draft'}</button>
      </div>
      {error && <p className="mt-4 rounded-lg bg-amber-400/10 p-3 text-sm text-amber-200">{error}</p>}
      <div className="mt-6 border-t border-white/10 pt-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-cyan-400" />
          <p className="text-sm font-semibold text-white">Buat gambar dengan AI</p>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <textarea value={imagePrompt} onChange={(event) => setImagePrompt(event.target.value)} rows={2} maxLength={2000} placeholder="Contoh: diagram alur request HTTP dari browser ke server" className="min-h-20 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400" />
          <button type="button" onClick={generateImage} disabled={imagePending || imagePrompt.trim().length < 5} className="rounded-xl border border-cyan-400/40 px-5 py-3 font-semibold text-cyan-300 disabled:opacity-50">{imagePending ? 'Membuat gambar...' : 'Buat gambar'}</button>
        </div>
        {imageError && <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-sm text-amber-200">{imageError}</p>}
        {imageData && <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/30 p-3"><img src={`data:${imageData.mimeType};base64,${imageData.data}`} alt={imagePrompt} className="h-auto w-full rounded-lg" /><p className="mt-2 text-xs text-slate-500">Preview gambar. Penyimpanan ke Supabase Storage kita sambungkan setelah hasil ini berhasil.</p></div>}
      </div>


      {status && <p className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{status}</p>}
      {draft && <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/70 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-cyan-400">{draft.category}</p><h3 className="mt-1 text-lg font-semibold text-white">{draft.title}</h3></div><div className="flex gap-2"><button type="button" onClick={cancelDraft} disabled={pending} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-50">Batal</button><button type="button" onClick={saveDraft} disabled={pending} className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">Simpan ke Vault</button></div></div><div className="mt-3 flex flex-wrap gap-2">{draft.tags.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">#{tag}</span>)}</div><pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-4 text-sm leading-6 text-slate-300">{draft.content}</pre></div>}
    </section>
  )
}
