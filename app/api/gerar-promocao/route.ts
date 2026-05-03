import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildPromocaoPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { tipo, valorPix, valorParcelado, links, images } = body

  const prompt = buildPromocaoPrompt({ tipo, valorPix, valorParcelado, links })
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const parts: object[] = [{ text: prompt }]
  for (const img of (images || [])) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } })
  }

  try {
    const result = await model.generateContent(parts)
    let text = result.response.text().trim()
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(text)
    return Response.json({ output: parsed.versoes || parsed })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar'
    return Response.json({ error: msg }, { status: 500 })
  }
}
