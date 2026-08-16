import Link from 'next/link'

const categories = ['Linux', 'Networking', 'Docker', 'VPS', 'SQL', 'General']

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-white/10 bg-slate-950/90 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">CHEATSHEET VAULT</p>
            <p className="mt-1 text-sm text-slate-500">Personal technical documentation</p>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">Masuk</Link>
            <Link href="/auth/register" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Daftar</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div>
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">Your knowledge, organized</p>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">Simpan command. <span className="text-cyan-400">Temukan lagi.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">Satu tempat untuk cheatsheet Linux, Docker, Networking, SQL, VPS, dan catatan teknis yang kamu butuhkan saat bekerja.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/auth/register" className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">Buat vault pertama</Link>
            <Link href="/auth/login" className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 hover:bg-white/10">Saya sudah punya akun</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-white/[.04] p-5 shadow-2xl shadow-cyan-950/20">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4"><span className="text-xs text-slate-500">~/cheatsheet-manager</span><span className="h-2 w-2 rounded-full bg-emerald-400" /></div>
          <pre className="overflow-x-auto text-sm leading-7 text-slate-300"><code><span className="text-cyan-400">$</span> docker ps{`\\n`}<span className="text-cyan-400">$</span> git status{`\\n`}<span className="text-cyan-400">$</span> psql --version{`\\n`}<span className="text-amber-300">// your notes, ready when you are</span></code></pre>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24"><p className="mb-5 text-xs uppercase tracking-[0.25em] text-slate-500">Browse by category</p><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.map((category) => <div key={category} className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm text-slate-300 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:text-cyan-300">{category}</div>)}</div></section>
    </main>
  )
}
