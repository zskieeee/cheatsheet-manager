'use client'

import Link from 'next/link'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const categories = ['Linux', 'Networking', 'Docker', 'VPS', 'SQL', 'General']

export default function NewCheatsheetPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/auth/login')
      else setUserId(data.user.id)
    })
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)

    if (!userId) {
      setError('Sesi login tidak ditemukan. Silakan login ulang.')
      setPending(false)
      return
    }

    const supabase = createClient()
    let imagePath: string | null = null

    if (image) {
      if (!image.type.startsWith('image/')) {
        setError('File harus berupa gambar.')
        setPending(false)
        return
      }
      if (image.size > 5 * 1024 * 1024) {
        setError('Ukuran gambar maksimal 5 MB.')
        setPending(false)
        return
      }

      imagePath = `${userId}/${crypto.randomUUID()}-${image.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
      const { error: uploadError } = await supabase.storage
        .from('cheatsheet-images')
        .upload(imagePath, image, { upsert: false })

      if (uploadError) {
        setError(uploadError.message)
        setPending(false)
        return
      }
    }

    const parsedTags = tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean)
    const { error: insertError } = await supabase.from('cheatsheets').insert({
      user_id: userId,
      title: title.trim(),
      category,
      tags: parsedTags,
      content: content.trim(),
      image_path: imagePath,
    })

    if (insertError) {
      setError(insertError.message)
      setPending(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm text-cyan-400 hover:underline">← Kembali ke dashboard</Link>
        <div className="mb-8 mt-8"><p className="text-xs font-bold tracking-[0.3em] text-cyan-400">NEW ENTRY</p><h1 className="mt-2 text-3xl font-bold text-white">Tambah cheatsheet</h1><p className="mt-2 text-slate-400">Simpan command atau catatan teknis baru ke vault kamu.</p></div>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[.04] p-6">
          <label className="block space-y-2 text-sm"><span>Judul</span><input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Contoh: Docker cleanup" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-400" /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="block space-y-2 text-sm"><span>Kategori</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-400">{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="block space-y-2 text-sm"><span>Tags</span><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="docker, cleanup, cli" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-400" /></label></div>
          <label className="block space-y-2 text-sm"><span>Gambar catatan (opsional, maksimal 5 MB)</span><input type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => setImage(event.target.files?.[0] ?? null)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300" /></label>
          <label className="block space-y-2 text-sm"><span>Markdown / command</span><textarea value={content} onChange={(event) => setContent(event.target.value)} required rows={14} placeholder={'```bash\ndocker system prune -af\n```'} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400" /></label>
          {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <div className="flex justify-end gap-3"><Link href="/dashboard" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Batal</Link><button disabled={pending} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">{pending ? 'Menyimpan...' : 'Simpan cheatsheet'}</button></div>
        </form>
      </div>
    </main>
  )
}
