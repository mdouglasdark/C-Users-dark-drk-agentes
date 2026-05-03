import Link from 'next/link'
import { Plane, FileText, CheckSquare, Megaphone } from 'lucide-react'

const modules = [
  {
    href: '/dashboard/propostas',
    icon: Plane,
    label: 'Propostas',
    desc: 'Aéreo, pacote ou hospedagem',
    color: 'bg-blue-500',
    light: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/dashboard/emissao',
    icon: FileText,
    label: 'Pós-Venda / Emissão',
    desc: 'Cliente, Discord, TICTIM e Sheets',
    color: 'bg-emerald-500',
    light: 'bg-emerald-50 text-emerald-600',
  },
  {
    href: '/dashboard/checkin',
    icon: CheckSquare,
    label: 'Check-in',
    desc: 'Mensagem de check-in para o cliente',
    color: 'bg-violet-500',
    light: 'bg-violet-50 text-violet-600',
  },
  {
    href: '/dashboard/promocoes',
    icon: Megaphone,
    label: 'Promoções',
    desc: 'Gera todas as versões com links',
    color: 'bg-orange-500',
    light: 'bg-orange-50 text-orange-600',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">O que vamos gerar hoje?</h2>
        <p className="text-slate-500 text-sm mt-1">Escolha o módulo abaixo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map(({ href, icon: Icon, label, desc, color, light }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${light} mb-4 group-hover:scale-105 transition-transform`}>
              <Icon size={22} />
            </div>
            <h3 className="font-semibold text-slate-800">{label}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
