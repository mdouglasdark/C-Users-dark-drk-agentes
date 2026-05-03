import { GoogleGenerativeAI, type Part } from '@google/generative-ai'
import { buildEmissaoPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { images, ...params } = body

  const prompt = buildEmissaoPrompt(params)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

  const parts: (string | Part)[] = [{ text: prompt }]
  for (const img of (images || [])) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } })
  }

  try {
    const result = await model.generateContent(parts)
    let text = result.response.text().trim()
    // remove markdown code fences if present
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(text)
    return Response.json({ output: parsed })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar'
    return Response.json({ error: msg }, { status: 500 })
  }
}
