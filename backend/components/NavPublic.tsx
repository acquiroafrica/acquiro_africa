'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'


interface Props {
  user: User | null
}

export default function NavPublic({ user }: Props) {
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()

  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    if (user) {
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setRole(data?.role || 'buyer'))
    }
  }, [user])
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="/" className="brand">
          <img src="/acquiro-logo.png" alt="Acquiro" style={{ height: 36, width: 'auto', display: 'block' }} />
        </a>
        <div className="nav-links">
          <a href="/#sellers">For sellers</a>
          <a href="/#buyers">For buyers</a>
          {(role === 'buyer' || role === 'admin' || !user) && <a href="/opportunities">Opportunities</a>}
          <a href="/#trust">How it works</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              {(role === 'buyer' || role === 'admin') && <a href="/opportunities" className="btn btn-ghost btn-sm">Opportunities</a>}
              <a href="/dashboard" className="btn btn-teal btn-sm">Dashboard</a>
              <button onClick={handleSignOut} className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }}>Sign out</button>
            </>
          ) : (
            <a href="/auth" className="btn btn-teal btn-sm">Sign in / Sign up</a>
          )}
        </div>
      </div>
    </nav>
  )
}

