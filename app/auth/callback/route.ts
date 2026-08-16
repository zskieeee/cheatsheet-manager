// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const oauthError = requestUrl.searchParams.get('error_description')

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(oauthError)}`, requestUrl.origin),
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=Kode OAuth tidak ditemukan', requestUrl.origin),
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin),
    )
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
