import type { Message } from 'ai'

// Parse [Source N] citations out of assistant text
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
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-2`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'gradient-primary text-white rounded-br-sm'
            : 'bg-white text-ink shadow-card rounded-bl-sm'
        }`}
      >
        {isUser
          ? message.content
          : renderWithCitations(message.content)}
      </div>
    </div>
  )
}
