'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Zap, BookOpen, Flame, Clock } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const [docCount, setDocCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      setEmail(user.email ?? '')
      const { count } = await sb
        .from('documents')
        .select('*', { count: 'exact', head: true })
      setDocCount(count ?? 0)
    })
  }, [router])

  async function signOut() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/auth')
  }

  const name = email.split('@')[0] ?? 'Student'
  const initials = name.slice(0, 2).toUpperCase()

  const statCards = [
    { label: 'Documents', value: docCount, icon: BookOpen, color: 'text-primary bg-green-50' },
    { label: 'XP Points',   value: 120,      icon: Zap,      color: 'text-accent-purple bg-purple-50' },
    { label: 'Day Streak',  value: 3,         icon: Flame,    color: 'text-accent-amber bg-amber-50' },
    { label: 'Study Hours', value: 4,         icon: Clock,    color: 'text-primary bg-green-50' },
  ]

  return (
    <div className="min-h-screen bg-sage pb-24">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Profile</h1>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-card-lg mb-3">
          {initials}
        </div>
        <p className="font-bold text-ink text-lg capitalize">{name}</p>
        <p className="text-sm text-muted">{email}</p>
        <span className="mt-2 bg-white rounded-full px-3 py-1 text-xs font-semibold text-primary shadow-card">
          Level 3 · Explorer
        </span>
      </div>

      <div className="mx-5 grid grid-cols-2 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-ink">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="profile" />
    </div>
  )
}
