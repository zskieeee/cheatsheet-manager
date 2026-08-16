// components/cheatsheet-search.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Star, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ArchiveButton } from '@/components/archive-button'
import { ImageZoom } from '@/components/image-zoom'

type CheatsheetCard = {
  id: string
  title: string
  category: string
  content: string
  tags: string[] | null
  imageUrl: string | null
  is_favorite: boolean
}

export function CheatsheetSearch({ cards }: { cards: CheatsheetCard[] }) {
  const [localCards, setLocalCards] = useState(cards)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setLocalCards(cards)
  }, [cards])

  const categories = useMemo(
    () => Array.from(new Set(localCards.map((item) => item.category).filter(Boolean))).sort(),
    [localCards],
  )

  const tags = useMemo(
    () => Array.from(new Set(localCards.flatMap((item) => item.tags ?? []).filter(Boolean))).sort(),
    [localCards],
  )

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return localCards.filter((item) => {
      const searchableText = [
        item.title,
        item.category,
        item.content,
        ...(item.tags ?? []),
      ].join(' ').toLowerCase()

      const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery)
      const matchesCategory = category === 'all' || item.category === category
      const matchesTag = tag === 'all' || (item.tags ?? []).includes(tag)
      const matchesFavorite = !favoritesOnly || item.is_favorite

      return matchesSearch && matchesCategory && matchesTag && matchesFavorite
    })
  }, [category, favoritesOnly, localCards, query, tag])

  async function toggleFavorite(id: string) {
    const current = localCards.find((item) => item.id === id)
    if (!current) return

    const nextValue = !current.is_favorite
    setError('')
    setSavingId(id)
    setLocalCards((items) => items.map((item) => item.id === id ? { ...item, is_favorite: nextValue } : item))

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('cheatsheets')
      .update({ is_favorite: nextValue })
      .eq('id', id)

    if (updateError) {
      setLocalCards((items) => items.map((item) => item.id === id ? { ...item, is_favorite: !nextValue } : item))
      setError(updateError.message)
    }

    setSavingId(null)
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[.04] p-4">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 shrink-0 text-cyan-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari judul, kategori, tag, atau isi catatan..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Hapus pencarian" className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setFavoritesOnly(false)} className={`rounded-full px-3 py-1.5 text-xs ${!favoritesOnly ? 'bg-cyan-400 font-semibold text-slate-950' : 'bg-white/10 text-slate-300'}`}>
            Semua
          </button>
          <button type="button" onClick={() => setFavoritesOnly((value) => !value)} className={`rounded-full px-3 py-1.5 text-xs ${favoritesOnly ? 'bg-amber-300 font-semibold text-slate-950' : 'bg-white/10 text-slate-300'}`}>
            ★ Favorite
          </button>

          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-full border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 outline-none">
            <option value="all">Semua kategori</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select value={tag} onChange={(event) => setTag(event.target.value)} className="rounded-full border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 outline-none">
            <option value="all">Semua tag</option>
            {tags.map((item) => <option key={item} value={item}>#{item}</option>)}
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{filteredCards.length} dari {localCards.length} catatan ditemukan</p>
          {error && <p className="text-xs text-red-300">Favorite gagal disimpan: {error}</p>}
        </div>
      </div>

      {!filteredCards.length ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-16 text-center">
          <h3 className="text-xl font-semibold text-white">Catatan tidak ditemukan</h3>
          <p className="mt-2 text-slate-400">Coba kata kunci atau filter lain.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCards.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-cyan-400">{item.category}</p>
                <button type="button" onClick={() => toggleFavorite(item.id)} disabled={savingId === item.id} aria-label={item.is_favorite ? 'Hapus dari favorite' : 'Tambah ke favorite'} className="rounded-md p-1 text-slate-500 transition hover:bg-white/10 disabled:opacity-50">
                  <Star className={`h-5 w-5 ${item.is_favorite ? 'fill-amber-300 text-amber-300' : ''}`} />
                </button>
              </div>

              <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
              {item.imageUrl && <ImageZoom src={item.imageUrl} alt={item.title} />}
              <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-400">{item.content}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {(item.tags ?? []).map((itemTag) => <span key={itemTag} className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">#{itemTag}</span>)}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <Link href={`/dashboard/cheatsheets/${item.id}`} className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300">Buka</Link>
                <Link href={`/dashboard/edit/${item.id}`} className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">Edit</Link>
                <ArchiveButton id={item.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
