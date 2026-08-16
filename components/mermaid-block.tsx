// components/mermaid-block.tsx
'use client'

import { useEffect, useId, useState } from 'react'
import mermaid from 'mermaid'

export function MermaidBlock({ chart }: { chart: string }) {
  const reactId = useId()
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const elementId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    let active = true

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'dark',
    })

    mermaid
      .render(elementId, chart)
      .then(({ svg: renderedSvg }) => {
        if (active) setSvg(renderedSvg)
      })
      .catch(() => {
        if (active) setError('Diagram Mermaid tidak dapat dirender.')
      })

    return () => {
      active = false
    }
  }, [chart, elementId])

  if (error) {
    return <pre className="overflow-x-auto rounded-xl border border-red-400/20 bg-red-950/20 p-4 text-sm text-red-300">{chart}</pre>
  }

  if (!svg) {
    return <div className="my-5 rounded-xl border border-white/10 bg-black/30 p-5 text-sm text-slate-400">Merender diagram...</div>
  }

  return <div className="my-5 overflow-x-auto rounded-xl border border-cyan-400/20 bg-slate-950/80 p-4" dangerouslySetInnerHTML={{ __html: svg }} />
}
