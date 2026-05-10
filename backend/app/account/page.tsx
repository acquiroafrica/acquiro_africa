'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardShell from '@/components/DashboardShell'
import type { Role } from '@/types'

export default function AccountPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<Role>('buyer')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (roleRow) {
          setRole(roleRow.role as Role)
          setFormData({
            first_name: roleRow.first_name || '',
            last_name: roleRow.last_name || '',
            phone_number: roleRow.phone_number || '',
          })
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('user_roles')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
      })
      .eq('user_id', user.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }
    setSaving(false)
  }

  if (loading) return <div className="dashboard-main">Loading profile...</div>

  return (
    <DashboardShell role={role} email={user?.email || ''}>
      <h1 className="page-title">User Account</h1>
      <p className="page-sub">Update your personal details and contact information.</p>

      <div className="card" style={{ maxWidth: 600 }}>
        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: 24 }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone_number}
              onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="08012345678"
              required
            />
          </div>

          <div className="form-group">
            <label>Account Role</label>
            <input
              type="text"
              value={role.charAt(0).toUpperCase() + role.slice(1)}
              disabled
              style={{ background: 'var(--paper)', cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              Role cannot be changed. Contact support if you need to switch roles.
            </p>
          </div>

          <button type="submit" className="btn btn-teal" disabled={saving}>
            {saving ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardShell>
  )
}
