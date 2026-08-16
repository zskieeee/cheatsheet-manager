// app/dashboard/cheatsheets/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createClient } from '@/lib/supabase/server'
import { MermaidBlock } from '@/components/mermaid-block'

export default async function CheatsheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: cheatsheet, error } = await supabase
    .from('cheatsheets')
    .select('id, title, category, tags, content, created_at, is_favorite')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .maybeSingle()

  if (error || !cheatsheet) notFound()

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400 hover:text-cyan-300">
            ← Kembali ke Dashboard
          </Link>
          <Link href={`/dashboard/edit/${cheatsheet.id}`} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
            Edit catatan
          </Link>
        </div>

        <article className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl sm:p-10">
          <div className="mb-8 border-b border-white/10 pb-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">{cheatsheet.category}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">{cheatsheet.title}</h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {(cheatsheet.tags ?? []).map((tag: string) => <span key={tag} className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">#{tag}</span>)}
            </div>
          </div>

          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-cyan-300 prose-strong:text-white prose-code:text-cyan-200 prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/40">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const language = /language-(\w+)/.exec(className ?? '')?.[1]
                  const code = String(children).replace(/\n$/, '')
                  if (language === 'mermaid') return <MermaidBlock chart={code} />
                  return <code className={className} {...props}>{children}</code>
                },
                pre({ children }) {
                  return <div className="my-4 overflow-x-auto">{children}</div>
                },
              }}
            >
              {cheatsheet.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  )
}
