import { streamText, type Message } from 'ai'
import { google } from '@ai-sdk/google'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { retrieveChunks, buildSystemPrompt } from '@/lib/rag'
import { RateLimitError } from '@/lib/gemini'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages, deepThink = false }: { messages: Message[]; deepThink: boolean } =
    await req.json()

  const lastMessage = messages[messages.length - 1]
  if (!lastMessage?.content) return new Response('Empty message', { status: 400 })

  try {
    const topK = deepThink ? 12 : 6
    const chunks = await retrieveChunks(lastMessage.content, topK)
    const systemPrompt = buildSystemPrompt(chunks, deepThink)

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    })

    return result.toAIStreamResponse()
  } catch (e) {
    if (e instanceof RateLimitError) {
      return new Response(e.message, { status: 429 })
    }
    console.error('Chat error:', e)
    return new Response('Chat service unavailable. Please try again.', { status: 500 })
  }
}
