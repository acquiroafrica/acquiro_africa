'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Listing } from '@/types'

interface Props {
  listings: Listing[]
}

export default function SellerDashboardClient({ listings }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const filteredListings = listings.filter(l => {
    if (filter === 'all') return true
    return l.status === filter
  })

  const counts = {
    all: listings.length,
    pending: listings.filter(l => l.status === 'pending').length,
    approved: listings.filter(l => l.status === 'approved').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  }

  const statusBadge = (s: string) => {
    const cls = s === 'approved' ? 'badge-approved' : s === 'rejected' ? 'badge-rejected' : 'badge-pending'
    return <span className={`tag ${cls}`} style={{ textTransform: 'capitalize' }}>{s}</span>
  }

  return (
    <>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--line)' }}>
        <div className="auth-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              className={`auth-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={{ padding: '12px 20px', fontSize: 13 }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.6 }}>({counts[f]})</span>
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <Link href="/listings/new" className="btn btn-gold">+ New listing</Link>
        </div>
      </div>

      {filteredListings.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Sector</th>
                <th>State</th>
                <th>Asking price</th>
                <th>Deal type</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.title}</td>
                  <td>{l.sector}</td>
                  <td>{l.state}</td>
                  <td>₦{l.asking_price}</td>
                  <td>{l.deal_type}</td>
                  <td>{statusBadge(l.status)}</td>
                  <td style={{ color: 'var(--muted)' }}>{new Date(l.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <h3>No {filter !== 'all' ? filter : ''} listings found</h3>
          <p>
            {filter === 'all' 
              ? 'Create your first confidential listing to start receiving qualified buyer interest.' 
              : `You don't have any listings with "${filter}" status at the moment.`}
          </p>
          {filter === 'all' && (
            <Link href="/listings/new" className="btn btn-gold" style={{ marginTop: 20, display: 'inline-flex' }}>
              Create a listing
            </Link>
          )}
        </div>
      )}
    </>
  )
}
