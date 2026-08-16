'use client'

import { useState } from 'react'

export function ImageZoom({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-4 block w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 text-left">
        <img src={src} alt={alt} className="h-48 w-full object-cover transition duration-200 hover:scale-[1.03]" />
        <span className="block px-3 py-2 text-xs text-slate-400">Klik gambar untuk memperbesar</span>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6" onClick={() => setOpen(false)}>
          <div className="relative max-h-[90vh] max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img src={src} alt={alt} className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl" />
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-lg text-white hover:bg-black">×</button>
          </div>
        </div>
      )}
    </>
  )
}
