'use client'

import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Acquiro<span>.</span> <span style={{ fontSize: 12, fontWeight: 'normal', color: 'var(--muted)' }}>ADMIN</span>
      </div>
      <nav className="sidebar-nav">
        <a href="/admin" className={`sidebar-link ${pathname === '/admin' ? 'active' : ''}`}>
          Overview
        </a>
        <a href="/admin/users" className={`sidebar-link ${pathname === '/admin/users' ? 'active' : ''}`}>
          User Profiles
        </a>
        <a href="/admin/listings" className={`sidebar-link ${pathname === '/admin/listings' ? 'active' : ''}`}>
          Listings
        </a>
        <a href="/admin/requests" className={`sidebar-link ${pathname === '/admin/requests' ? 'active' : ''}`}>
          Buyer Requests
        </a>
      </nav>
      <div style={{ position: 'absolute', bottom: 32, left: 24, right: 24 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 8, wordBreak: 'break-all' }}>
          {email}
        </div>
        <button onClick={handleSignOut} className="btn btn-ghost btn-sm btn-full" style={{ color: 'rgba(255,255,255,.7)', borderColor: 'rgba(255,255,255,.2)' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
