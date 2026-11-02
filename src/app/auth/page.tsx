'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MascotIcon from '@/components/MascotIcon'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const sb = createClient()
    const { error: authError } =
      mode === 'sign_in'
        ? await sb.auth.signInWithPassword({ email, password })
        : await sb.auth.signUp({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  async function signInWithGoogle() {
    const sb = createClient()
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-sage flex flex-col items-center justify-center px-5">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-card-lg mb-3">
          <MascotIcon size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-ink">Study Buddy</h1>
        <p className="text-sm text-muted mt-1">Your AI-powered study assistant</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-ink mb-5">
          {mode === 'sign_in' ? 'Sign in' : 'Create account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white font-semibold rounded-xl py-2.5 text-sm disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'sign_in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <p className="relative bg-white px-2 text-xs text-muted text-center">or</p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-ink hover:bg-gray-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-muted mt-4">
          {mode === 'sign_in' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(m => m === 'sign_in' ? 'sign_up' : 'sign_in'); setError('') }}
            className="text-primary font-semibold"
          >
            {mode === 'sign_in' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
