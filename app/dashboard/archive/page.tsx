// app/dashboard/archive/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RestoreButton } from '@/components/restore-button'

export default async function ArchivePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: archived, error } = await supabase
    .from('cheatsheets')
    .select('id, title, category, tags, content, created_at')
    .eq('user_id', user.id)
    .eq('is_archived', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-amber-300">CHEATSHEET VAULT</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Archive</h1>
            <p className="mt-2 text-sm text-slate-400">Catatan di sini belum dihapus dari database.</p>
          </div>
          <Link href="/dashboard" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400 hover:text-cyan-300">
            ← Kembali ke Dashboard
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">
            Gagal mengambil archive: {error.message}
          </div>
        ) : !archived?.length ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-16 text-center">
            <h2 className="text-xl font-semibold text-white">Archive masih kosong</h2>
            <p className="mt-2 text-slate-400">Catatan yang kamu arsipkan akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {archived.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
                <p className="text-xs text-amber-300">{item.category}</p>
                <h2 className="mt-2 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-400">{item.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(item.tags ?? []).map((tag: string) => <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400">#{tag}</span>)}
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <RestoreButton id={item.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
