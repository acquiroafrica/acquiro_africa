'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import type { Role } from '@/types'

interface Props {
  children: React.ReactNode
  role: Role
  email: string
}

const sellerLinks = [
  { href: '/dashboard', label: 'My Listings', icon: '📋' },
  { href: '/listings/new', label: 'New Listing', icon: '➕' },
  { href: '/account', label: 'User Account', icon: '👤' },
]

const buyerLinks = [
  { href: '/opportunities', label: 'All Opportunities', icon: '🔍' },
  { href: '/my-opportunities', label: 'My Opportunities', icon: '🎯' },
  { href: '/account', label: 'User Account', icon: '👤' },
]

export default function DashboardShell({ children, role, email }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = role === 'seller' ? sellerLinks : buyerLinks

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          Acquiro<span>.</span> <span style={{ fontSize: 12, fontWeight: 'normal', color: 'var(--muted)', textTransform: 'uppercase' }}>{role}</span>
        </div>
        <nav className="sidebar-nav">
          {links.map(l => {
            const isActive = pathname === l.href
            return (
              <a key={l.href} href={l.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <span>{l.icon}</span>
                {l.label}
              </a>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: '24px 24px 0', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 10, wordBreak: 'break-all' }}>{email}</p>
          <span style={{ fontSize: 11, background: 'rgba(244,163,0,.15)', color: 'var(--gold)', padding: '3px 8px', borderRadius: 12, textTransform: 'capitalize', display: 'inline-block', marginBottom: 16 }}>{role}</span>
          <button onClick={signOut} className="btn btn-ghost btn-sm btn-full" style={{ borderColor: 'rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)' }}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}
