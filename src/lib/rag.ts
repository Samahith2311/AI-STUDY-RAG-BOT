import { createClient } from '@/lib/supabase/server'
import { embedText } from '@/lib/gemini'

export interface RetrievedChunk {
  id: string
  document_id: string
  content: string
  filename: string
  similarity: number
}

export async function retrieveChunks(
  query: string,
  topK = 8
): Promise<RetrievedChunk[]> {
  const embedding = await embedText(query)
  const supabase = createClient()

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    query_text: query,
    match_count: topK,
  })

  if (error) throw new Error(`Retrieval failed: ${error.message}`)
  return (data ?? []) as RetrievedChunk[]
}

export function buildSystemPrompt(chunks: RetrievedChunk[], deepThink: boolean): string {
  if (chunks.length === 0) {
    return [
      'You are a study assistant.',
      'No relevant materials were found for this question.',
      'Tell the user exactly: "I couldn\'t find that in your uploaded materials.',
      'Please upload relevant documents first, then ask again."',
    ].join('\n')
  }

  const context = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.filename}]\n${c.content}`)
    .join('\n\n---\n\n')

  const mode = deepThink
    ? 'Think step by step. Provide a thorough, well-structured answer with examples where helpful.'
    : 'Be concise and direct. Answer in as few words as the question needs.'

  return `You are a study assistant that answers ONLY from the provided source materials.

${mode}

Rules:
1. Use ONLY the context below to form your answer.
2. After each factual claim, add a citation like [Source 1] or [Source 2] using the source numbers above.
3. If the context does not contain the answer, say exactly: "I couldn't find that in your materials."
4. Never invent, infer, or add facts not present in the context.

Context:
${context}`
}
