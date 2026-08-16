// components/code-block.tsx
'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const aliases: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  js: 'javascript',
  ts: 'typescript',
  yml: 'yaml',
  md: 'markdown',
}

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  const normalizedLanguage = aliases[language ?? ''] ?? language ?? 'text'

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="group relative my-5 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-500">
        <span>{normalizedLanguage}</span>
        <button type="button" onClick={copyCode} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-300 hover:bg-white/10 hover:text-white">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Tersalin' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter language={normalizedLanguage} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.875rem', lineHeight: '1.7' }} wrapLongLines>
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
