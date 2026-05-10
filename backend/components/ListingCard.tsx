'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/types'

interface Props {
  listing: Listing
  user: User | null
  existingRequestStatus?: string
}

export default function ListingCard({ listing: l, user, existingRequestStatus }: Props) {
  const supabase = createClient()
  const [status, setStatus] = useState(existingRequestStatus)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function requestAccess() {
    if (!user) { window.location.href = '/auth?role=buyer'; return }
    setLoading(true)
    const { error } = await supabase.from('access_requests').insert({
      listing_id: l.id,
      buyer_id: user.id,
      note: note || null,
    })
    if (!error) { 
      setStatus('pending'); 
      setSubmitted(true);
      
      // Notify admin (fire and forget)
      fetch('/api/notify-admin/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing: l, user, note }),
      }).catch(err => console.error('Failed to notify admin:', err));
    }
    setLoading(false)
  }

  const buttonLabel = !user
    ? 'Sign in to request'
    : status === 'pending'
    ? '⏳ Request sent'
    : status === 'approved'
    ? '✅ Access granted'
    : status === 'rejected'
    ? '❌ Not approved'
    : 'Request access'

  const buttonDisabled = !!status && status !== 'pending'

  return (
    <>
      <article className="deal-card">
        <div className="deal-body">
          <div className="deal-top">
            <span className="tag">{l.sector}</span>
            <span className="tag" style={{ background: '#d1fae5', color: '#065f46' }}>Reviewed</span>
          </div>
          <h3 className="deal-title">{l.title}</h3>
          <p className="deal-meta">{l.state}{l.lga ? `, ${l.lga}` : ''} · {l.deal_type}</p>
          <div className="deal-metrics">
            <div className="deal-metric"><b>{l.revenue_band}</b><span>Revenue</span></div>
            <div className="deal-metric"><b>{l.years_operating}</b><span>Years operating</span></div>
            <div className="deal-metric"><b>{l.staff_range}</b><span>Staff</span></div>
          </div>
          <p className="deal-desc">{l.description}</p>
          <div className="deal-footer">
            <span className="deal-price">₦{l.asking_price}</span>
            <button
              className="btn btn-gold btn-sm"
              onClick={() => !status ? setShowModal(true) : undefined}
              disabled={!!status && status !== 'pending' || (status === 'pending')}
              style={status === 'pending' ? { opacity: .65, cursor: 'default' } : undefined}
            >
              {buttonLabel === 'Request access' ? 'View Deal →' : buttonLabel}
            </button>
          </div>
        </div>
      </article>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📩</div>
                <h2 style={{ marginBottom: 12, fontSize: '1.3rem' }}>Request Sent</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                  Your contact information and request for <strong>{l.title}</strong> have been sent to the admin. We will review your profile and reach out soon.
                </p>
                <button className="btn btn-teal" style={{ marginTop: 24 }} onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: 8, fontSize: '1.3rem' }}>Request Buyer Access</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
                  Requesting access to: <strong>{l.title}</strong> in {l.state}. Your contact details (phone and email) will be shared with the admin to verify your request.
                </p>
                <div className="form-group">
                  <label htmlFor="access-note">Optional note (why are you a good fit?)</label>
                  <textarea
                    id="access-note"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Share your background, budget, acquisition timeline, or why this business interests you."
                    rows={4}
                  />
                </div>
                <button
                  className="btn btn-teal btn-full"
                  onClick={requestAccess}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Send request'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
