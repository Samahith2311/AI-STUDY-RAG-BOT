// Split text into overlapping chunks. Keeps headings attached to their paragraph.
const CHUNK_SIZE = 500     // characters per chunk
const CHUNK_OVERLAP = 100  // characters of overlap between chunks

export interface Chunk {
  content: string
  index: number
}

export function chunkText(text: string): Chunk[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)

  const chunks: Chunk[] = []
  let current = ''
  let index = 0

  for (const para of paragraphs) {
    const isHeading = /^#{1,6}\s/.test(para) || /^[A-Z][^.!?]{0,60}$/.test(para)

    if (current.length + para.length > CHUNK_SIZE && current.length > 0) {
      chunks.push({ content: current.trim(), index: index++ })
      // keep overlap: tail of current so context bridges the boundary
      current = current.slice(Math.max(0, current.length - CHUNK_OVERLAP)) + '\n\n' + para
    } else {
      current = current ? current + '\n\n' + para : para
    }

    // flush non-heading chunks that are large enough
    if (!isHeading && current.length >= CHUNK_SIZE) {
      chunks.push({ content: current.trim(), index: index++ })
      current = ''
    }
  }

  if (current.trim()) {
    chunks.push({ content: current.trim(), index: index++ })
  }

  return chunks
}
