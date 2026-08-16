// app/api/ai/image/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function findImage(value: unknown): { data: string; mimeType: string } | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>

  if (typeof item.data === 'string' && (typeof item.mime_type === 'string' || typeof item.mimeType === 'string')) {
    return {
      data: item.data,
      mimeType: (item.mime_type ?? item.mimeType) as string,
    }
  }

  for (const child of Object.values(item)) {
    const image = findImage(child)
    if (image) return image
  }

  if (Array.isArray(value)) {
    for (const child of value) {
      const image = findImage(child)
      if (image) return image
    }
  }

  return null
}

function providerMessage(value: unknown) {
  if (!value || typeof value !== 'object') return 'Pesan provider tidak tersedia.'
  const error = (value as { error?: { message?: unknown } }).error
  return typeof error?.message === 'string' ? error.message.slice(0, 240) : 'Pesan provider tidak tersedia.'
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY belum dikonfigurasi di server.' }, { status: 500 })

    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    if (prompt.length < 5) return NextResponse.json({ error: 'Prompt gambar terlalu singkat.' }, { status: 400 })
    if (prompt.length > 2000) return NextResponse.json({ error: 'Prompt gambar maksimal 2000 karakter.' }, { status: 400 })

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'gemini-3.1-flash-image',
        store: false,
        input: prompt,
      } ),
    })

    const data: unknown = await response.json()

    if (!response.ok) {
      const message = providerMessage(data)
      console.error('Gemini image provider error:', { status: response.status, message })
      return NextResponse.json({ error: `Gemini image ${response.status}: ${message}` }, { status: response.status === 429 ? 429 : 502 })
    }

    const image = findImage(data)
    if (!image) return NextResponse.json({ error: 'Gemini tidak mengembalikan gambar. Model image mungkin belum tersedia untuk key ini.' }, { status: 502 })

    return NextResponse.json({ image })
  } catch (error) {
    console.error('Gemini image route error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Terjadi error internal image generation.' }, { status: 500 })
  }
}
