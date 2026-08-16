import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY belum dikonfigurasi di server.' }, { status: 500 })
    }

    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    if (!prompt || prompt.length < 5) {
      return NextResponse.json({ error: 'Instruksi AI terlalu singkat.' }, { status: 400 })
    }

    if (prompt.length > 2000) {
      return NextResponse.json({ error: 'Instruksi maksimal 2000 karakter.' }, { status: 400 })
    }

    const response = await client.chat.completions.create({
      model: 'gpt-5-mini',
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'cheatsheet_draft',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              category: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              content: { type: 'string' },
            },
            required: ['title', 'category', 'tags', 'content'],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten dokumentasi teknis. Buat draft cheatsheet yang akurat, ringkas, dan aman. Output harus JSON sesuai schema. Jangan mengarang hasil eksekusi command. Gunakan kategori Linux, Networking, Docker, VPS, SQL, atau General. Isi content harus Markdown dengan contoh command jika relevan.',
        },
        { role: 'user', content: prompt },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'AI tidak mengembalikan draft.' }, { status: 502 })

    return NextResponse.json(JSON.parse(content))
  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json({ error: 'Gagal menghubungi AI. Periksa API key dan koneksi provider.' }, { status: 500 })
  }
}
