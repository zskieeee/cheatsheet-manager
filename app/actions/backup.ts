// app/actions/backup.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const categories = new Set(['Linux', 'Networking', 'Docker', 'VPS', 'SQL', 'General'])

function cleanTags(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 30)
}

export async function importCheatsheets(jsonText: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi login tidak ditemukan.' }
  if (jsonText.length > 5_000_000) return { error: 'File backup terlalu besar.' }

  try {
    const parsed = JSON.parse(jsonText)
    const source = Array.isArray(parsed) ? parsed : parsed?.cheatsheets

    if (!Array.isArray(source) || source.length === 0) {
      return { error: 'Format backup tidak valid atau tidak berisi catatan.' }
    }

    if (source.length > 500) {
      return { error: 'Maksimal 500 catatan per import.' }
    }

    const rows = source.map((item: unknown) => {
      if (!item || typeof item !== 'object') throw new Error('Ada item backup yang tidak valid.')
      const record = item as Record<string, unknown>
      const title = typeof record.title === 'string' ? record.title.trim() : ''
      const content = typeof record.content === 'string' ? record.content.trim() : ''
      const rawCategory = typeof record.category === 'string' ? record.category.trim() : 'General'

      if (!title || !content) throw new Error('Setiap catatan wajib memiliki judul dan isi.')
      if (title.length > 200 || content.length > 500_000) throw new Error('Ada catatan yang ukurannya terlalu besar.')

      return {
        user_id: user.id,
        title,
        category: categories.has(rawCategory) ? rawCategory : 'General',
        tags: cleanTags(record.tags),
        content,
        is_favorite: record.is_favorite === true,
        is_archived: false,
      }
    })

    const { error } = await supabase.from('cheatsheets').insert(rows)
    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: `${rows.length} cheatsheet berhasil diimpor.` }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'File backup tidak valid.' }
  }
}
