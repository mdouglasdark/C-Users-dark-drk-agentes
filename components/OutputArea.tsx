'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  label?: string
  value: string
  onChange: (v: string) => void
}

export default function OutputArea({ label, value, onChange }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors ml-auto"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={12}
        className="w-full rounded-xl border border-gray-200 p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y bg-gray-50"
      />
    </div>
  )
}
