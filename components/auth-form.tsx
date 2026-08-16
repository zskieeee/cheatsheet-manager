// components/auth-form.tsx
'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GoogleSignInButton } from '@/components/google-sign-in-button'

type Props = { mode: 'login' | 'register' }

export function AuthForm({ mode }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, setPending] = useState(false)
  const [googlePending, setGooglePending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setPending(true)

    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (result.error) {
      setError(result.error.message)
      setPending(false)
      return
    }

    if (mode === 'register' && !result.data.session) {
      setSuccess('Registrasi berhasil. Periksa email untuk verifikasi akun.')
      setPending(false)
      return
    }

    window.location.href = '/dashboard'
  }

  async function handleGoogleLogin() {
    setError('')
    setSuccess('')
    setGooglePending(true)

    const supabase = createClient()
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })

    if (googleError) {
      setError(googleError.message)
      setGooglePending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/[.04] p-8 shadow-2xl">
      <div>
        <p className="mb-2 text-sm font-medium text-cyan-400">CHEATSHEET VAULT</p>
        <h1 className="text-3xl font-bold text-white">{mode === 'login' ? 'Masuk ke vault' : 'Buat akun baru'}</h1>
        <p className="mt-2 text-sm text-slate-400">Simpan catatan teknis pribadi secara terstruktur.</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={pending || googlePending}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold">G</span>
        {googlePending ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        atau gunakan email
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleSignInButton />

      <div className="flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-white/10" />atau gunakan email<span className="h-px flex-1 bg-white/10" /></div>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Email</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} name="email" type="email" required className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-400" />
      </label>

      <GoogleSignInButton />

      <div className="flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-white/10" />atau gunakan email<span className="h-px flex-1 bg-white/10" /></div>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Password</span>
        <input value={password} onChange={(event) => setPassword(event.target.value)} name="password" type="password" minLength={6} required className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyan-400" />
      </label>

      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{success}</p>}

      <button disabled={pending || googlePending} className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">
        {pending ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
      </button>

      <p className="text-center text-sm text-slate-400">
        {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
        <Link className="text-cyan-400 hover:underline" href={mode === 'login' ? '/auth/register' : '/auth/login'}>
          {mode === 'login' ? 'Daftar' : 'Masuk'}
        </Link>
      </p>
    </form>
  )
}
