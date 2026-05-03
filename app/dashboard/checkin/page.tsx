'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import OutputArea from '@/components/OutputArea'

interface ImageFile { file: File; preview: string }

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

export default function CheckinPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [passageiros, setPassageiros] = useState('')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  async function gerar(e: React.FormEvent) {
    e.preventDefault()
    if (images.length === 0) { setError('Adicione pelo menos um print do cartão de embarque.'); return }
    setLoading(true)
    setError('')
    setOutput('')

    const imageData = await Promise.all(images.map(i => toBase64(i.file)))

    const res = await fetch('/api/gerar-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passageiros, images: imageData }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) { setError(data.error); return }
    setOutput(data.output)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Check-in</h2>
        <p className="text-slate-500 text-sm">Gera a mensagem de check-in para envio ao cliente</p>
      </div>

      <form onSubmit={gerar} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Print do cartão de embarque</h3>
          <ImageUpload images={images} onChange={setImages} maxImages={4} />
          <p className="text-xs text-slate-400">Se houver múltiplos trechos, adicione todos os prints</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Passageiros</h3>
          <textarea
            value={passageiros}
            onChange={e => setPassageiros(e.target.value)}
            required
            rows={3}
            placeholder={"João Silva\nMaria Silva"}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
          <p className="text-xs text-slate-400">Um nome por linha</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Gerando mensagem...' : '✨ Gerar Check-in'}
        </button>
      </form>

      {output && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <OutputArea label="Mensagem de check-in — edite se necessário" value={output} onChange={setOutput} />
        </div>
      )}
    </div>
  )
}
