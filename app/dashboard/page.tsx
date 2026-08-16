// app/dashboard/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import { AiCheatsheetPanel } from '@/components/ai-cheatsheet-panel'
import { CheatsheetSearch } from '@/components/cheatsheet-search'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: cheatsheets } = await supabase
    .from('cheatsheets')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  const cards = await Promise.all((cheatsheets ?? []).map(async (item) => {
    let imageUrl: string | null = null

    if (item.image_path) {
      const { data } = await supabase.storage
        .from('cheatsheet-images')
        .createSignedUrl(item.image_path, 3600)
      imageUrl = data?.signedUrl ?? null
    }

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      content: item.content,
      tags: item.tags,
      imageUrl,
      is_favorite: Boolean(item.is_favorite),
    }
  }))

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">CHEATSHEET VAULT</p>
            <h1 className="mt-1 text-xl font-bold text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/archive" className="rounded-lg border border-amber-300/30 px-4 py-2 text-sm font-semibold text-amber-200 hover:border-amber-300 hover:text-amber-100">Archive</Link>
            <Link href="/dashboard/new" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
              + Tambah Cheatsheet
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <AiCheatsheetPanel />

        <div className="mb-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/[.05] p-6">
          <p className="text-sm text-slate-400">Login sebagai</p>
          <p className="mt-1 text-lg font-semibold text-cyan-300">{user.email}</p>
        </div>

        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Knowledge base</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Catatan teknis</h2>
          </div>
          <span className="text-sm text-slate-500">{cards.length} aktif</span>
        </div>

        {!cards.length ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-16 text-center">
            <h3 className="text-xl font-semibold text-white">Belum ada cheatsheet aktif</h3>
            <p className="mt-2 text-slate-400">Buat catatan pertama atau pulihkan item dari arsip nanti.</p>
          </div>
        ) : (
          <CheatsheetSearch cards={cards} />
        )}
      </section>
    </main>
  )
}
