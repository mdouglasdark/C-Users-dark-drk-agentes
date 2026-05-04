import { GoogleGenAI } from '@google/genai'
import { buildEmissaoPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { images, ...params } = body

  const prompt = buildEmissaoPrompt(params)

  const parts = [
    { text: prompt },
    ...(images || []).map((img: { base64: string; mimeType: string }) => ({
      inlineData: { mimeType: img.mimeType, data: img.base64 },
    })),
  ]

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts }],
    })
    let text = (response.text ?? '').trim()
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(text)
    return Response.json({ output: parsed })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar'
    return Response.json({ error: msg }, { status: 500 })
  }
}
