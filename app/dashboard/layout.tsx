'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plane, FileText, CheckSquare, Megaphone, LogOut, Settings, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard/propostas',  label: 'Propostas',  icon: Plane },
  { href: '/dashboard/emissao',    label: 'Emissão',    icon: FileText },
  { href: '/dashboard/checkin',    label: 'Check-in',   icon: CheckSquare },
  { href: '/dashboard/promocoes',  label: 'Promoções',  icon: Megaphone },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboardHome = pathname === '/dashboard'

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {!isDashboardHome && (
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft size={20} />
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Plane className="text-white" size={14} />
            </div>
            <span className="font-semibold text-slate-800 text-sm">DRK Viagens</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/admin/links"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Configurações"
          >
            <Settings size={18} />
          </Link>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Nav pills — only on sub-pages */}
      {!isDashboardHome && (
        <nav className="bg-white border-b border-slate-100 px-4 overflow-x-auto">
          <div className="flex gap-1 py-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
