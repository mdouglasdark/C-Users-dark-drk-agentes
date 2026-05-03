'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/ImageUpload'
import OutputArea from '@/components/OutputArea'

interface ImageFile { file: File; preview: string }
interface Grupo { id: string; nome: string; link: string; ordem: number }
interface Versao { grupo: string; mensagem: string }

async function toBase64(file: File) {
  return new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve({ base64: dataUrl.split(',')[1], mimeType: file.type })
    }
    reader.onerror = reject
  })
}

export default function PromocoesPage() {
  const [tipo, setTipo] = useState('aereo')
  const [valorPix, setValorPix] = useState('')
  const [valorParcelado, setValorParcelado] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(false)
  const [versoes, setVersoes] = useState<Versao[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('grupos_promocao')
      .select('*')
      .eq('ativo', true)
      .order('ordem')
      .then(({ data }) => { if (data) setGrupos(data) })
  }, [])

  async function gerar(e: React.FormEvent) {
    e.preventDefault()
    if (images.length === 0) { setError('Adicione pelo menos um print.'); return }
    if (grupos.length === 0) { setError('Nenhum grupo cadastrado. Configure em Configurações.'); return }
    setLoading(true)
    setError('')
    setVersoes([])

    const imageData = await Promise.all(images.map(i => toBase64(i.file)))
    const links = grupos.map(g => ({ nome: g.nome, link: g.link }))

    const res = await fetch('/api/gerar-promocao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, valorPix, valorParcelado, links, images: imageData }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) { setError(data.error); return }
    setVersoes(data.output)
    setActiveIdx(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Promoções</h2>
        <p className="text-slate-500 text-sm">Gera uma versão para cada grupo de WhatsApp</p>
      </div>

      <form onSubmit={gerar} className="space-y-5">
        {/* Tipo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Tipo de oferta</h3>
          <div className="flex gap-2">
            {[{ value: 'aereo', label: '✈️ Passagem aérea' }, { value: 'pacote', label: '🏖️ Pacote' }].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTipo(value)}
                className={`flex-1 text-sm py-2.5 px-3 rounded-xl border transition-colors ${
                  tipo === value
                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Prints */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Print da oferta</h3>
          <ImageUpload images={images} onChange={setImages} maxImages={3} />
        </div>

        {/* Valores */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Valores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor PIX (R$)</label>
              <input
                type="text"
                value={valorPix}
                onChange={e => setValorPix(e.target.value)}
                required
                placeholder="Ex: 850,00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor parcelado (R$)</label>
              <input
                type="text"
                value={valorParcelado}
                onChange={e => setValorParcelado(e.target.value)}
                required
                placeholder="Ex: 1.000,00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          {grupos.length > 0 && (
            <p className="text-xs text-slate-400">{grupos.length} grupos configurados — será gerada uma versão para cada</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Gerando promoções...' : `✨ Gerar ${grupos.length || ''} Versões`}
        </button>
      </form>

      {versoes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          {/* Group tabs */}
          <div className="flex flex-wrap gap-1">
            {versoes.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeIdx === i
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {v.grupo || `Grupo ${i + 1}`}
              </button>
            ))}
          </div>
          <OutputArea
            value={versoes[activeIdx]?.mensagem || ''}
            onChange={v => setVersoes(prev => prev.map((item, i) => i === activeIdx ? { ...item, mensagem: v } : item))}
          />
        </div>
      )}
    </div>
  )
}
