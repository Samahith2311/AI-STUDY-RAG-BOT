'use client'

import { useChat } from 'ai/react'
import { useState, useRef, useEffect } from 'react'
import { Send, Zap } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import ChatMessage from '@/components/ChatMessage'
import MascotIcon from '@/components/MascotIcon'

const subjects = ['Biology', 'Math', 'History', 'Chemistry', 'Economics', 'Physics']

export default function ChatPage() {
  const [deepThink, setDeepThink] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: { deepThink },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isIdle = messages.length === 0

  return (
    <div className="min-h-screen bg-sage flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Chat</h1>
        <button
          onClick={() => setDeepThink(v => !v)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            deepThink
              ? 'gradient-primary text-white shadow-card'
              : 'bg-white text-muted border border-gray-200'
          }`}
          aria-pressed={deepThink}
          title="Deep Think: retrieve more context and reason step-by-step"
        >
          <Zap size={13} />
          Deep Think
        </button>
      </div>

      {/* Messages or idle state */}
      <div className="flex-1 overflow-y-auto px-4 chat-scroll">
        {isIdle ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-card-lg">
              <MascotIcon size={44} className="text-white" />
            </div>
            <p className="text-lg font-semibold text-ink text-center">How can I help you today?</p>
            <p className="text-sm text-muted text-center max-w-xs">
              Ask me anything about your uploaded study materials.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() =>
                    handleInputChange({
                      target: { value: `Help me study ${s}` },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-full px-4 py-1.5 text-sm font-medium text-ink shadow-card hover:shadow-card-lg transition-shadow"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {messages.map(m => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex gap-1.5 px-4">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            )}
            {error && (
              <p className="text-center text-sm text-red-500 px-4">
                {error.message ?? 'Something went wrong. Please try again.'}
              </p>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar — sits above the bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-white rounded-2xl shadow-card-lg px-4 py-3"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your materials…"
            className="flex-1 text-sm text-ink placeholder:text-muted outline-none bg-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center disabled:opacity-40 transition-opacity"
            aria-label="Send"
          >
            <Send size={15} className="text-white" />
          </button>
        </form>
      </div>

      <BottomNav active="chat" />
    </div>
  )
}
