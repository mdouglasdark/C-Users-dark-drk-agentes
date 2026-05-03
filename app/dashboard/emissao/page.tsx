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

const tabs = [
  { key: 'cliente',  label: '📱 Cliente' },
  { key: 'discord',  label: '💬 Discord' },
  { key: 'tictim',   label: '📋 TICTIM' },
  { key: 'sheets',   label: '📊 Sheets' },
]

export default function EmissaoPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [passageiros, setPassageiros] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [taxaCartao, setTaxaCartao] = useState('')
  const [receita, setReceita] = useState('')
  const [custoAereo, setCustoAereo] = useState('')
  const [fornecedorAereo, setFornecedorAereo] = useState('')
  const [custoHotel, setCustoHotel] = useState('')
  const [fornecedorHotel, setFornecedorHotel] = useState('')
  const [custoSeguro, setCustoSeguro] = useState('')
  const [dataVenda, setDataVenda] = useState('')
  const [colaborador, setColaborador] = useState('')
  const [canal, setCanal] = useState('')
  const [loading, setLoading] = useState(false)
  const [outputs, setOutputs] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('cliente')
  const [error, setError] = useState('')

  async function gerar(e: React.FormEvent) {
    e.preventDefault()
    if (images.length === 0) { setError('Adicione pelo menos um print.'); return }
    setLoading(true)
    setError('')
    setOutputs({})

    const imageData = await Promise.all(images.map(i => toBase64(i.file)))

    const res = await fetch('/api/gerar-emissao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passageiros, formaPagamento, taxaCartao, receita,
        custoAereo, fornecedorAereo, custoHotel, fornecedorHotel,
        custoSeguro, dataVenda, colaborador, canal,
        images: imageData,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) { setError(data.error); return }
    setOutputs(data.output)
    setActiveTab('cliente')
  }

  const hasOutputs = Object.keys(outputs).length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Pós-Venda / Emissão</h2>
        <p className="text-slate-500 text-sm">Gera mensagem ao cliente, Discord, TICTIM e linha do Sheets</p>
      </div>

      <form onSubmit={gerar} className="space-y-5">
        {/* Prints */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Prints dos bilhetes e reservas</h3>
          <ImageUpload images={images} onChange={setImages} maxImages={8} />
        </div>

        {/* Passageiros */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Passageiros</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nomes (um por linha — ex: João Silva)
            </label>
            <textarea
              value={passageiros}
              onChange={e => setPassageiros(e.target.value)}
              required
              rows={3}
              placeholder={"João Silva\nMaria Silva"}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>
        </div>

        {/* Financeiro */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Dados financeiros</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Forma de pagamento</label>
              <select
                value={formaPagamento}
                onChange={e => setFormaPagamento(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option>PIX</option>
                <option>Cartão de crédito</option>
                <option>Boleto</option>
              </select>
            </div>

            {formaPagamento === 'Cartão de crédito' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Taxa do cartão (%)</label>
                <input
                  type="text"
                  value={taxaCartao}
                  onChange={e => setTaxaCartao(e.target.value)}
                  placeholder="Ex: 3,5"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Receita (R$)</label>
              <input
                type="text"
                value={receita}
                onChange={e => setReceita(e.target.value)}
                required
                placeholder="Ex: 2.500,00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Custo aéreo (R$)</label>
              <input
                type="text"
                value={custoAereo}
                onChange={e => setCustoAereo(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fornecedor aéreo</label>
              <input
                type="text"
                value={fornecedorAereo}
                onChange={e => setFornecedorAereo(e.target.value)}
                placeholder="Ex: Flytour"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Custo hotel (R$)</label>
              <input
                type="text"
                value={custoHotel}
                onChange={e => setCustoHotel(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fornecedor hotel</label>
              <input
                type="text"
                value={fornecedorHotel}
                onChange={e => setFornecedorHotel(e.target.value)}
                placeholder="Ex: Booking"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Custo seguro (R$)</label>
              <input
                type="text"
                value={custoSeguro}
                onChange={e => setCustoSeguro(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>

        {/* Operacional */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Dados operacionais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data da venda</label>
              <input
                type="date"
                value={dataVenda}
                onChange={e => setDataVenda(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Colaborador</label>
              <input
                type="text"
                value={colaborador}
                onChange={e => setColaborador(e.target.value)}
                required
                placeholder="Ex: Ana"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Canal de captação</label>
              <input
                type="text"
                value={canal}
                onChange={e => setCanal(e.target.value)}
                required
                placeholder="Ex: Instagram, Indicação, WhatsApp..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Gerando mensagens...' : '✨ Gerar Mensagens'}
        </button>
      </form>

      {hasOutputs && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-100 pb-3">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <OutputArea
            value={outputs[activeTab] || ''}
            onChange={v => setOutputs(prev => ({ ...prev, [activeTab]: v }))}
          />
        </div>
      )}
    </div>
  )
}
