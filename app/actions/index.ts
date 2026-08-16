'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Email dan password wajib diisi.' }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || password.length < 6) {
    return { error: 'Email wajib diisi dan password minimal 6 karakter.' }
  }

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  if (data.session) redirect('/dashboard')
  return { success: 'Registrasi berhasil. Periksa email untuk verifikasi.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index)
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function createCheatsheet(formData: FormData) {
  const { supabase, user } = await getCurrentUser()
  if (!user) return { error: 'Sesi login tidak ditemukan.' }

  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? 'General').trim()
  const content = String(formData.get('content') ?? '').trim()
  const tags = parseTags(formData.get('tags'))

  if (!title || !content) return { error: 'Judul dan isi wajib diisi.' }

  const { error } = await supabase.from('cheatsheets').insert({
    user_id: user.id,
    title,
    category,
    tags,
    content,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: 'Cheatsheet berhasil dibuat.' }
}

export async function updateCheatsheet(formData: FormData) {
  const { supabase, user } = await getCurrentUser()
  if (!user) return { error: 'Sesi login tidak ditemukan.' }

  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? 'General').trim()
  const content = String(formData.get('content') ?? '').trim()
  const tags = parseTags(formData.get('tags'))

  if (!id || !title || !content) return { error: 'ID, judul, dan isi wajib diisi.' }

  const { error } = await supabase
    .from('cheatsheets')
    .update({ title, category, tags, content })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: 'Cheatsheet berhasil diperbarui.' }
}

export async function toggleFavorite(id: string) {
  const { supabase, user } = await getCurrentUser()
  if (!user) return { error: 'Sesi login tidak ditemukan.' }

  const { data, error: readError } = await supabase
    .from('cheatsheets')
    .select('is_favorite')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (readError || !data) return { error: 'Cheatsheet tidak ditemukan.' }

  const { error } = await supabase
    .from('cheatsheets')
    .update({ is_favorite: !data.is_favorite })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: 'Favorit diperbarui.' }
}

export async function deleteCheatsheet(id: string) {
  const { supabase, user } = await getCurrentUser()
  if (!user) return { error: 'Sesi login tidak ditemukan.' }

  const { error } = await supabase
    .from('cheatsheets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: 'Cheatsheet berhasil dihapus.' }
}
