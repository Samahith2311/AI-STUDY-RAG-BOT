'use client'

import { useChat } from 'ai/react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Zap, RotateCcw, Trash2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import ChatMessage from '@/components/ChatMessage'
import MascotIcon from '@/components/MascotIcon'
import { createClient } from '@/lib/supabase/client'

const subjects = ['Biology', 'Math', 'History', 'Chemistry', 'Economics', 'Physics']

export default function ChatPage() {
  const [deepThink, setDeepThink] = useState(false)
  const [convId, setConvId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sb = createClient()

  // Create or resume a conversation on mount
  useEffect(() => {
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      // load most recent conversation
      const { data } = await sb
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) {
        setConvId(data.id)
      } else {
        const { data: newConv } = await sb
          .from('conversations')
          .insert({ user_id: user.id })
          .select()
          .single()
        if (newConv) setConvId(newConv.id)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveMessage = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      if (!convId) return
      await sb.from('chat_messages').insert({ conversation_id: convId, role, content })
    },
    [convId, sb]
  )

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, setMessages } =
    useChat({
      api: '/api/chat',
      body: { deepThink },
      onFinish: msg => saveMessage('assistant', msg.content),
    })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startNewChat() {
    setMessages([])
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    const { data } = await sb
      .from('conversations')
      .insert({ user_id: user.id })
      .select()
      .single()
    if (data) setConvId(data.id)
  }

  const isIdle = messages.length === 0

  return (
    <div className="min-h-screen bg-sage flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Chat</h1>
        <div className="flex items-center gap-2">
          {!isIdle && (
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-xs font-medium text-muted shadow-card hover:text-ink transition-colors"
              title="New chat"
            >
              <Trash2 size={12} />
              New chat
            </button>
          )}
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
          <div className="space-y-6 py-4">
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
              <div className="flex flex-col items-center gap-2 py-2">
                <p className="text-center text-sm text-red-500">
                  {error.message ?? 'Something went wrong.'}
                </p>
                <button
                  onClick={() => reload()}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <RotateCcw size={12} />
                  Retry
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2">
        <form
          onSubmit={e => {
            const userInput = input.trim()
            handleSubmit(e)
            if (userInput) saveMessage('user', userInput)
          }}
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
