'use client'

import { useState } from 'react'
import { updateAccessRequestStatus, updateBuyerMandateStatus } from '../actions'

interface AccessRequest {
  id: string
  listing_title: string
  buyer_name: string
  buyer_phone: string
  buyer_email: string
  status: string
  created_at: string
  note?: string
}

interface BuyerMandate {
  id: string
  buyer_name: string
  buyer_phone: string
  buyer_email: string
  sector: string
  budget_range: string
  deal_type: string
  status: string
  created_at: string
  description: string
}


interface Props {
  accessRequests: AccessRequest[]
  buyerMandates: BuyerMandate[]
}

export default function RequestsClient({ accessRequests, buyerMandates }: Props) {
  const [tab, setTab] = useState<'access' | 'mandates'>('access')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAccess(id: string, status: 'approved' | 'rejected') {
    setLoading(id)
    try {
      await updateAccessRequestStatus(id, status)
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  async function handleMandate(id: string) {
    setLoading(id)
    try {
      await updateBuyerMandateStatus(id, 'reviewed')
    } catch (err) {
      alert('Failed to mark as reviewed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div className="auth-tabs" style={{ marginBottom: 24, justifyContent: 'flex-start', borderBottom: '1px solid var(--line)' }}>
        <button 
          className={`auth-tab ${tab === 'access' ? 'active' : ''}`} 
          onClick={() => setTab('access')}
          style={{ background: 'none', padding: '12px 24px' }}
        >
          Access Requests ({accessRequests.length})
        </button>
        <button 
          className={`auth-tab ${tab === 'mandates' ? 'active' : ''}`} 
          onClick={() => setTab('mandates')}
          style={{ background: 'none', padding: '12px 24px' }}
        >
          Buyer Mandates ({buyerMandates.length})
        </button>
      </div>

      {tab === 'access' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Opportunity</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accessRequests.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No access requests.</td></tr>
              ) : (
                accessRequests.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div><strong>{r.buyer_name}</strong></div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.buyer_email}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.buyer_phone}</div>
                    </td>
                    <td>{r.listing_title}</td>
                    <td>
                      <span className={`tag ${r.status === 'approved' ? 'badge-approved' : r.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn btn-teal btn-sm" 
                            disabled={loading === r.id}
                            onClick={() => handleAccess(r.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-sm" 
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                            disabled={loading === r.id}
                            onClick={() => handleAccess(r.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Requirements</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyerMandates.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No buyer mandates.</td></tr>
              ) : (
                buyerMandates.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div><strong>{m.buyer_name}</strong></div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.buyer_email}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.buyer_phone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}><strong>{m.sector}</strong> · {m.deal_type}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Budget: {m.budget_range}</div>
                    </td>
                    <td>
                      <span className={`tag ${m.status === 'reviewed' ? 'badge-approved' : 'badge-pending'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                      {m.status === 'pending' && (
                        <button 
                          className="btn btn-teal btn-sm" 
                          disabled={loading === m.id}
                          onClick={() => handleMandate(m.id)}
                        >
                          Mark Reviewed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
