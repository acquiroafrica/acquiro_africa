'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { SECTORS, STATES, REVENUE_BANDS, DEAL_TYPES } from '@/types'

interface Props { user: User | null }

export default function BuyerRequestModal({ user }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    sector: SECTORS[0],
    preferred_state: STATES[0],
    budget_range: REVENUE_BANDS[0],
    deal_type: DEAL_TYPES[0],
    description: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { window.location.href = '/auth?role=buyer'; return }
    setLoading(true); setError('')

    const { error: err } = await supabase.from('buyer_requests').insert({
      ...form,
      buyer_id: user.id,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSubmitted(true); setLoading(false)
  }

  return (
    <>
      <button className="btn btn-teal" onClick={() => setOpen(true)}>
        Submit a business request
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(false)}>✕</button>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
                <h2 style={{ marginBottom: 12, fontSize: '1.3rem' }}>Request received</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                  Thank you. Our team will review your criteria and reach out if a matching opportunity becomes available.
                </p>
                <button className="btn btn-ghost" style={{ marginTop: 24 }} onClick={() => { setOpen(false); setSubmitted(false) }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: 8, fontSize: '1.3rem' }}>Submit a Business Request</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
                  Tell us what you're looking to acquire or invest in. We'll match you when the right business becomes available.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={submit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Sector of interest</label>
                      <select value={form.sector} onChange={e => set('sector', e.target.value)}>
                        {SECTORS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Preferred state</label>
                      <select value={form.preferred_state} onChange={e => set('preferred_state', e.target.value)}>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Budget range</label>
                      <select value={form.budget_range} onChange={e => set('budget_range', e.target.value)}>
                        {REVENUE_BANDS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Deal type</label>
                      <select value={form.deal_type} onChange={e => set('deal_type', e.target.value)}>
                        {DEAL_TYPES.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>What are you looking for?</label>
                    <textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Describe the type of business, revenue range, operating history, customer type, or any other criteria that matter to you."
                    />
                  </div>
                  <button type="submit" className="btn btn-teal btn-full" disabled={loading}>
                    {loading ? 'Submitting…' : !user ? 'Sign in to submit' : 'Submit request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
