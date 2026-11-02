'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { Message } from 'ai'

function renderWithCitations(text: string) {
  const parts = text.split(/(\[Source \d+(?:,\s*\d+)*\])/g)
  return parts.map((part, i) => {
    if (/^\[Source/.test(part)) {
      return (
        <cite
          key={i}
          className="inline-block bg-green-50 text-primary text-xs font-semibold rounded px-1.5 py-0.5 mx-0.5 not-italic"
        >
          {part}
        </cite>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  function copy() {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-2 group`}>
      <div className="relative max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'gradient-primary text-white rounded-br-sm'
              : 'bg-white text-ink shadow-card rounded-bl-sm'
          }`}
        >
          {isUser ? message.content : renderWithCitations(message.content)}
        </div>
        {/* Copy button — visible on hover for assistant messages */}
        {!isUser && (
          <button
            onClick={copy}
            className="absolute -bottom-5 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-muted hover:text-ink"
            aria-label="Copy response"
          >
            {copied
              ? <><Check size={11} className="text-primary" /> Copied</>
              : <><Copy size={11} /> Copy</>}
          </button>
        )}
      </div>
    </div>
  )
}
