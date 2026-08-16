// app/api/ai/generate/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const systemPrompt = `Kamu adalah asisten dokumentasi teknis. Buat draft cheatsheet yang akurat, ringkas, dan aman.
Balas HANYA JSON valid tanpa markdown code fence dengan struktur:
{
  "title": "string",
  "category": "Linux | Networking | Docker | VPS | SQL | General",
  "tags": ["string"],
  "content": "Markdown string"
}
Jangan mengarang hasil eksekusi command. Gunakan contoh command jika relevan.`

type Draft = {
  title: string
  category: string
  tags: string[]
  content: string
}

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.title === 'string' && typeof item.category === 'string' && typeof item.content === 'string' && Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === 'string')
}

function findText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const item = value as Record<string, unknown>

  if (typeof item.output_text === 'string') return item.output_text
  if (typeof item.text === 'string') return item.text

  for (const child of Object.values(item)) {
    const text = findText(child)
    if (text) return text
  }

  if (Array.isArray(value)) {
    for (const child of value) {
      const text = findText(child)
      if (text) return text
    }
  }

  return ''
}

function providerMessage(value: unknown) {
  if (!value || typeof value !== 'object') return 'Pesan provider tidak tersedia.'
  const error = (value as { error?: { message?: unknown } }).error
  return typeof error?.message === 'string' ? error.message.slice(0, 240) : 'Pesan provider tidak tersedia.'
}

function cleanJson(value: string) {
  return value.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY belum dikonfigurasi di server.' }, { status: 500 })

    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    if (prompt.length < 5) return NextResponse.json({ error: 'Instruksi AI terlalu singkat.' }, { status: 400 })
    if (prompt.length > 2000) return NextResponse.json({ error: 'Instruksi maksimal 2000 karakter.' }, { status: 400 })

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        model: 'gemini-3.7-flash',
        store: false,
        input: `${systemPrompt}\n\nInstruksi pengguna:\n${prompt}`,
      } ),
    })

    const data: unknown = await response.json()
    if (!response.ok) {
      const message = providerMessage(data)
      console.error('Gemini provider error:', { status: response.status, message })
      return NextResponse.json({ error: `Gemini ${response.status}: ${message}` }, { status: response.status === 429 ? 429 : 502 })
    }

    const raw = cleanJson(findText(data))
    if (!raw) return NextResponse.json({ error: 'Gemini tidak mengembalikan teks output.' }, { status: 502 })

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Output Gemini bukan JSON valid.' }, { status: 502 })
    }

    if (!isDraft(parsed)) return NextResponse.json({ error: 'JSON Gemini tidak sesuai format cheatsheet.' }, { status: 502 })
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Gemini route error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Terjadi error internal pada route Gemini.' }, { status: 500 })
  }
}
