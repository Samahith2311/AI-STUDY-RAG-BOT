// Uses Gemini REST API directly so no extra SDK dependency is needed.
// text-embedding-004 default output is 768 dimensions — must match pgvector column.
const EMBED_MODEL = 'text-embedding-004'
export const EMBED_DIM = 768
export const CHAT_MODEL = 'gemini-1.5-flash'

export class RateLimitError extends Error {
  constructor() {
    super('Gemini rate limit reached. Please wait a moment and try again.')
    this.name = 'RateLimitError'
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function embedText(text: string): Promise<number[]> {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    }
  )

  if (res.status === 429) throw new RateLimitError()
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Embedding failed (${res.status}): ${body}`)
  }

  const data = await res.json()
  return data.embedding.values as number[]
}

// Embed multiple texts with exponential backoff on 429
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = []
  for (const text of texts) {
    let attempt = 0
    while (true) {
      try {
        results.push(await embedText(text))
        break
      } catch (e) {
        if (e instanceof RateLimitError && attempt < 4) {
          await sleep(Math.pow(2, attempt) * 1500)
          attempt++
        } else {
          throw e
        }
      }
    }
  }
  return results
}
