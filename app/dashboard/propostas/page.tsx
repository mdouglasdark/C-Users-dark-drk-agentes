'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import OutputArea from '@/components/OutputArea'

interface ImageFile { file: File; preview: string }

const tipoOptions = [
  { value: 'aereo',       label: '✈️ Só aéreo' },
  { value: 'pacote',      label: '🏖️ Pacote (aéreo + hotel)' },
  { value: 'misto',       label: '🔀 Misto' },
  { value: 'hospedagem',  label: '🏨 Só hospedagem' },
]

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

export default function PropostasPage() {
  const [tipo, setTipo] = useState('aereo')
  const [nome, setNome] = useState('')
  const [passageiros, setPassageiros] = useState('1')
  const [valorPix, setValorPix] = useState('')
  const [parcelas, setParcelas] = useState('10')
  const [valorParcela, setValorParcela] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  async function gerar(e: React.FormEvent) {
    e.preventDefault()
    if (images.length === 0) { setError('Adicione pelo menos um print.'); return }
    setLoading(true)
    setError('')
    setOutput('')

    const imageData = await Promise.all(images.map(i => toBase64(i.file)))

    const res = await fetch('/api/gerar-proposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, nome, passageiros, valorPix, parcelas, valorParcela, images: imageData }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) { setError(data.error); return }
    setOutput(data.output)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Proposta de Viagem</h2>
        <p className="text-slate-500 text-sm">Faça upload dos prints e preencha os valores</p>
      </div>

      <form onSubmit={gerar} className="space-y-5">
        {/* Tipo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Tipo de proposta</h3>
          <div className="grid grid-cols-2 gap-2">
            {tipoOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTipo(value)}
                className={`text-sm py-2.5 px-3 rounded-xl border transition-colors text-left ${
                  tipo === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
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
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Prints dos voos{tipo !== 'aereo' ? ' e hospedagem' : ''}</h3>
          <ImageUpload images={images} onChange={setImages} />
        </div>

        {/* Dados */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Dados do atendimento</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do cliente</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                placeholder="Ex: João Silva"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Passageiros</label>
              <input
                type="number"
                min="1"
                value={passageiros}
                onChange={e => setPassageiros(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor PIX (R$)</label>
              <input
                type="text"
                value={valorPix}
                onChange={e => setValorPix(e.target.value)}
                required
                placeholder="Ex: 1.850,00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parcelas (qtde)</label>
              <select
                value={parcelas}
                onChange={e => setParcelas(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {[2,3,4,5,6,7,8,9,10,11,12].map(n => (
                  <option key={n} value={n}>{n}x</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor da parcela (R$)</label>
              <input
                type="text"
                value={valorParcela}
                onChange={e => setValorParcela(e.target.value)}
                required
                placeholder="Ex: 185,00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Gerando proposta...' : '✨ Gerar Proposta'}
        </button>
      </form>

      {output && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <OutputArea label="Proposta gerada — edite se necessário antes de copiar" value={output} onChange={setOutput} />
        </div>
      )}
    </div>
  )
}
