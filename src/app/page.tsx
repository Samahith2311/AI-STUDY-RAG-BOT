'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, MessageCircle, Upload, Zap, Brain, Calculator } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import MascotIcon from '@/components/MascotIcon'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      setUserName(user.email?.split('@')[0] ?? 'there')
    })
  }, [router])

  const quickActions = [
    { label: 'Ask a Question', href: '/chat', icon: MessageCircle },
    { label: 'Upload Notes', href: '/library', icon: Upload },
    { label: 'Quiz Me', href: '/chat?mode=quiz', icon: Zap },
    { label: 'Summarize', href: '/chat?mode=summarize', icon: BookOpen },
  ]

  const features = [
    { icon: Calculator, label: 'Math Solver', color: 'text-accent-purple bg-purple-50' },
    { icon: Brain, label: 'Deep Think', color: 'text-primary bg-green-50' },
    { icon: BookOpen, label: 'Textbooks', color: 'text-accent-amber bg-amber-50' },
  ]

  const tasks = [
    'Review Chapter 3 notes',
    'Practice calculus problems',
    'Read economics summary',
  ]

  return (
    <div className="min-h-screen bg-sage pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-muted font-medium">Good day,</p>
            <h1 className="text-2xl font-bold text-ink">
              {userName ? `Hi ${userName}! 👋` : 'Need help studying today?'}
            </h1>
          </div>
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-card">
            <MascotIcon size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickActions.map(a => (
            <Link
              key={a.label}
              href={a.href}
              className="flex-shrink-0 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-card text-sm font-medium text-ink hover:shadow-card-lg transition-shadow"
            >
              <a.icon size={15} className="text-primary" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Upgrade Card */}
      <div className="mx-5 mb-6 rounded-2xl gradient-primary p-5 text-white shadow-card-lg">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Study Buddy Pro</p>
        <p className="font-bold text-lg leading-tight mb-3">
          Unlock unlimited uploads &amp; deep analysis
        </p>
        <button className="bg-white text-primary font-semibold text-sm rounded-full px-5 py-2 hover:opacity-90 transition-opacity">
          Upgrade free →
        </button>
      </div>

      {/* Feature Tiles */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-semibold text-ink mb-3">Tools</h2>
        <div className="grid grid-cols-3 gap-3">
          {features.map(f => (
            <Link
              key={f.label}
              href="/chat"
              className="bg-white rounded-2xl p-4 shadow-card flex flex-col items-center gap-2 hover:shadow-card-lg transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.color}`}>
                <f.icon size={20} />
              </div>
              <span className="text-xs font-medium text-center text-ink leading-tight">{f.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="mx-5 bg-white rounded-2xl shadow-card p-5">
        <h2 className="text-base font-semibold text-ink mb-3">Today&apos;s Tasks</h2>
        <ul className="space-y-3">
          {tasks.map((task, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full border-2 border-primary flex-shrink-0" />
              <span className="text-sm text-ink">{task}</span>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav active="home" />
    </div>
  )
}
