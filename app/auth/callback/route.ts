// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  let response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=Kode OAuth tidak ditemukan', requestUrl.origin),
    )
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')
            ?.split('; ')
            .filter(Boolean)
            .map((item) => {
              const separator = item.indexOf('=')
              return {
                name: separator >= 0 ? item.slice(0, separator) : item,
                value: separator >= 0 ? decodeURIComponent(item.slice(separator + 1)) : '',
              }
            }) ?? []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    response = NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin),
    )
  }

  return response
}
