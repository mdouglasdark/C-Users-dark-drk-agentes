import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildCheckinPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { passageiros, images } = await req.json()

  const prompt = buildCheckinPrompt(passageiros)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const parts: object[] = [{ text: prompt }]
  for (const img of (images || [])) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } })
  }

  try {
    const result = await model.generateContent(parts)
    return Response.json({ output: result.response.text() })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar'
    return Response.json({ error: msg }, { status: 500 })
  }
}
