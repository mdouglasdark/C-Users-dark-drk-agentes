import { GoogleGenAI } from '@google/genai'
import { buildCheckinPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { passageiros, images } = await req.json()

  const prompt = buildCheckinPrompt(passageiros)

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
    return Response.json({ output: response.text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar'
    return Response.json({ error: msg }, { status: 500 })
  }
}
