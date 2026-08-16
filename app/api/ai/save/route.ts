// app/api/ai/save/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Sesi login tidak ditemukan.' }, { status: 401 })
    }

    const body = await request.json()
    const draft = body?.draft

    if (!draft || typeof draft.title !== 'string' || typeof draft.category !== 'string' || typeof draft.content !== 'string' || !Array.isArray(draft.tags)) {
      return NextResponse.json({ error: 'Format draft tidak valid.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('cheatsheets')
      .insert({
        user_id: user.id,
        title: draft.title.trim(),
        category: draft.category.trim(),
        tags: draft.tags.filter((tag: unknown): tag is string => typeof tag === 'string'),
        content: draft.content,
        is_archived: false,
        is_favorite: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Save AI draft error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Save AI route error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Gagal menyimpan draft AI.' }, { status: 500 })
  }
}
