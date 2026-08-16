'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const categories = ['Linux', 'Networking', 'Docker', 'VPS', 'SQL', 'General']

type Cheatsheet = {
  id: string
  title: string
  category: string
  tags: string[] | null
  content: string
}

export default function EditCheatsheetPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<Cheatsheet | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { data, error: readError } = await supabase
        .from('cheatsheets')
        .select('id, title, category, tags, content')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (readError || !data) {
        setError('Cheatsheet tidak ditemukan atau bukan milik akun ini.')
        return
      }

      setItem(data)
      setTitle(data.title)
      setCategory(data.category)
      setTags((data.tags ?? []).join(', '))
      setContent(data.content)
    }

    load()
  }, [params.id, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!item) return
    setPending(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/auth/login')
      return
    }

    const { error: updateError } = await supabase
      .from('cheatsheets')
      .update({
        title: title.trim(),
        category,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
        content: content.trim(),
      })
      .eq('id', item.id)
      .eq('user_id', user.id)

    if (updateError) {
      setError(updateError.message)
      setPending(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (error && !item) return <main className="min-h-screen bg-slate-950 p-8 text-red-300">{error}</main>
  if (!item) return <main className="min-h-screen bg-slate-950 p-8 text-slate-400">Memuat cheatsheet...</main>

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm text-cyan-400 hover:underline">← Kembali ke dashboard</Link>
        <div className="mb-8 mt-8"><p className="text-xs font-bold tracking-[0.3em] text-cyan-400">EDIT ENTRY</p><h1 className="mt-2 text-3xl font-bold text-white">Edit cheatsheet</h1></div>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[.04] p-6">
          <label className="block space-y-2 text-sm"><span>Judul</span><input value={title} onChange={(event) => setTitle(event.target.value)} required className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-400" /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="block space-y-2 text-sm"><span>Kategori</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white">{categories.map((value) => <option key={value}>{value}</option>)}</select></label><label className="block space-y-2 text-sm"><span>Tags</span><input value={tags} onChange={(event) => setTags(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" /></label></div>
          <label className="block space-y-2 text-sm"><span>Markdown / command</span><textarea value={content} onChange={(event) => setContent(event.target.value)} required rows={14} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm text-white" /></label>
          {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <div className="flex justify-end gap-3"><Link href="/dashboard" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Batal</Link><button disabled={pending} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">{pending ? 'Menyimpan...' : 'Simpan perubahan'}</button></div>
        </form>
      </div>
    </main>
  )
}
