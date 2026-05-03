import { GoogleGenerativeAI, type Part } from '@google/generative-ai'
import { buildPropostaPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { tipo, nome, passageiros, valorPix, parcelas, valorParcela, images } = body

  const prompt = buildPropostaPrompt({ tipo, nome, passageiros, valorPix, parcelas, valorParcela })
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' })

  const parts: (string | Part)[] = [{ text: prompt }]
  for (const img of (images || [])) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } })
  }

  try {
    const result = await model.generateContent(parts)
    const text = result.response.text()
    return Response.json({ output: text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar'
    return Response.json({ error: msg }, { status: 500 })
  }
}
