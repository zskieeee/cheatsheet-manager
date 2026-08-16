// components/profile-menu.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Archive, ChevronDown, LogOut, UserRound } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'

export function ProfileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] p-1.5 pr-3 transition hover:border-cyan-400/50 hover:bg-white/10"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">
          {initial}
        </span>
        <span className="hidden max-w-36 truncate text-xs text-slate-300 sm:block">{email}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
          <div className="border-b border-white/10 px-3 py-3">
            <p className="text-xs text-slate-500">Login sebagai</p>
            <p className="mt-1 truncate text-sm font-medium text-white">{email}</p>
          </div>

          <Link href="/dashboard/archive" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
            <Archive className="h-4 w-4 text-amber-300" />
            Archive
          </Link>

          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
            <UserRound className="h-4 w-4 text-cyan-300" />
            Dashboard
          </Link>

          <div className="mt-2 flex items-center gap-3 border-t border-white/10 px-3 py-2 text-sm text-red-300">
            <LogOut className="h-4 w-4" />
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}
