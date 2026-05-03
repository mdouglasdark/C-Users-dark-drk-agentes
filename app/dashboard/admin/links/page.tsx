'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, GripVertical, Save } from 'lucide-react'

interface Grupo {
  id?: string
  nome: string
  link: string
  ordem: number
  ativo: boolean
}

export default function AdminLinksPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('grupos_promocao')
      .select('*')
      .order('ordem')
      .then(({ data }) => {
        if (data) setGrupos(data)
        setLoading(false)
      })
  }, [])

  function addGrupo() {
    setGrupos(prev => [...prev, { nome: '', link: '', ordem: prev.length + 1, ativo: true }])
  }

  function update(index: number, field: keyof Grupo, value: string | boolean) {
    setGrupos(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g))
  }

  function remove(index: number) {
    setGrupos(prev => prev.filter((_, i) => i !== index))
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const supabase = createClient()

    // Delete all and re-insert (simplest approach for small dataset)
    const { error: delErr } = await supabase.from('grupos_promocao').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    if (delErr) {
      setMsg('Erro ao salvar: ' + delErr.message)
      setSaving(false)
      return
    }

    const toInsert = grupos
      .filter(g => g.nome.trim() && g.link.trim())
      .map((g, i) => ({ nome: g.nome.trim(), link: g.link.trim(), ordem: i + 1, ativo: g.ativo }))

    const { error: insErr } = await supabase.from('grupos_promocao').insert(toInsert)

    setSaving(false)
    if (insErr) {
      setMsg('Erro ao salvar: ' + insErr.message)
    } else {
      setMsg('Grupos salvos com sucesso!')
      setTimeout(() => setMsg(''), 3000)
      // Refresh with new IDs
      const { data } = await supabase.from('grupos_promocao').select('*').order('ordem')
      if (data) setGrupos(data)
    }
  }

  if (loading) {
    return <div className="text-slate-500 text-sm p-6">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Grupos de Promoção</h2>
        <p className="text-slate-500 text-sm">Configure os links dos grupos de WhatsApp para as promoções</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        {grupos.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">Nenhum grupo cadastrado ainda.</p>
        )}

        <div className="space-y-3">
          {grupos.map((grupo, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical size={16} className="text-slate-300 flex-shrink-0" />

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={grupo.nome}
                  onChange={e => update(i, 'nome', e.target.value)}
                  placeholder="Nome do grupo (ex: Grupo 01)"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  type="url"
                  value={grupo.link}
                  onChange={e => update(i, 'link', e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <label className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={grupo.ativo}
                  onChange={e => update(i, 'ativo', e.target.checked)}
                  className="rounded"
                />
                Ativo
              </label>

              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addGrupo}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus size={16} />
          Adicionar grupo
        </button>
      </div>

      {msg && (
        <p className={`text-sm px-4 py-3 rounded-xl ${msg.startsWith('Erro') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {msg}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save size={18} />
        {saving ? 'Salvando...' : 'Salvar grupos'}
      </button>
    </div>
  )
}
