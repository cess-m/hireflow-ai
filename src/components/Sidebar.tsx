'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Create Job', href: '/jobs/new' },
  { label: 'Automation Logs', href: '/automation-logs' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 shrink-0 bg-slate-950 border-r border-slate-200 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-800">
        <span className="text-white font-semibold text-sm tracking-wide">HireFlow AI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition ${
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
