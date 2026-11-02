import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chunkText } from '@/lib/chunking'
import { embedBatch, RateLimitError } from '@/lib/gemini'

export const runtime = 'nodejs' // pdf-parse requires Node.js (not edge)

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/x-markdown']
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload a PDF, .txt, or .md file.' },
      { status: 400 }
    )
  }

  try {
    // --- extract text ---
    let text: string
    if (file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const buffer = Buffer.from(await file.arrayBuffer())
      const parsed = await pdfParse(buffer)
      text = parsed.text
    } else {
      text = await file.text()
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text from this file.' }, { status: 400 })
    }

    // --- create document record ---
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({ user_id: user.id, filename: file.name, file_size: file.size })
      .select()
      .single()
    if (docError) throw docError

    // --- chunk and embed ---
    const chunks = chunkText(text)
    const embeddings = await embedBatch(chunks.map(c => c.content))

    const rows = chunks.map((chunk, i) => ({
      document_id: doc.id,
      content: chunk.content,
      embedding: embeddings[i],
      chunk_index: chunk.index,
    }))

    const { error: chunkError } = await supabase.from('chunks').insert(rows)
    if (chunkError) throw chunkError

    return NextResponse.json({ success: true, documentId: doc.id, chunks: chunks.length })
  } catch (e) {
    if (e instanceof RateLimitError) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
