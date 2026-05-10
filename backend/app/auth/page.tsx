'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types'

import { Suspense } from 'react'

function AuthForm() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<Role>('buyer')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const r = params.get('role')
    if (r === 'seller') { setRole('seller'); setTab('signup') }
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (tab === 'signup') {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      setSuccess('Account created! You can now log in.')
      setTab('login')
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) { setError(loginError.message); setLoading(false); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!roleRow) {
          await fetch('/api/repair-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          })
        }

        const role = roleRow?.role ?? 'buyer'
        if (role === 'admin') {
          router.push('/admin')
        } else if (role === 'seller') {
          router.push('/dashboard')
        } else {
          router.push('/opportunities')
        }
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <img src="/acquiro-logo.png" alt="Acquiro" style={{ height: 40, width: 'auto', marginBottom: 12 }} />
        <p>The confidential marketplace for Nigerian SME transactions.</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Log in</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Create account</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--ink)' }}>I am a…</p>
              <div className="role-grid" style={{ marginBottom: 20 }}>
                <div className={`role-card ${role === 'buyer' ? 'selected' : ''}`} onClick={() => setRole('buyer')}>
                  <h4>Buyer</h4>
                  <p>Looking to acquire or invest</p>
                </div>
                <div className={`role-card ${role === 'seller' ? 'selected' : ''}`} onClick={() => setRole('seller')}>
                  <h4>Seller</h4>
                  <p>Exploring an exit or partnership</p>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>

          {tab === 'signup' && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="08012345678"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'Min 8 characters' : 'Your password'}
              minLength={tab === 'signup' ? 8 : 1}
            />
          </div>

          <button type="submit" className="btn btn-teal btn-full" disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 20 }}>
          <a href={process.env.NEXT_PUBLIC_FRONTEND_URL || "/"} style={{ color: 'var(--teal)' }}>← Back to home</a>
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="auth-wrap">
        <div className="auth-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading auth...</p>
        </div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
