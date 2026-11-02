'use client'

import Link from 'next/link'
import { Home, MessageCircle, Library, User } from 'lucide-react'

type Tab = 'home' | 'chat' | 'library' | 'profile'

const tabs: { id: Tab; href: string; icon: typeof Home; label: string }[] = [
  { id: 'home',    href: '/',        icon: Home,          label: 'Home' },
  { id: 'chat',    href: '/chat',    icon: MessageCircle, label: 'Chat' },
  { id: 'library', href: '/library', icon: Library,       label: 'Library' },
  { id: 'profile', href: '/profile', icon: User,          label: 'Profile' },
]

export default function BottomNav({ active }: { active: Tab }) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50"
    >
      <ul className="flex">
        {tabs.map(t => {
          const isActive = t.id === active
          return (
            <li key={t.id} className="flex-1">
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted hover:text-ink'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <t.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {t.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
