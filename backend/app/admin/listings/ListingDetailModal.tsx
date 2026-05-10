'use client'

import type { Listing } from '@/types'

interface Props {
  listing: Listing & { seller_email?: string; financials_signed_url?: string; audit_report_signed_url?: string }
  onClose: () => void
}

export default function ListingDetailModal({ listing: l, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div style={{ marginBottom: 24 }}>
          <span className="tag" style={{ marginBottom: 8 }}>{l.sector}</span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{l.title}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            {l.state}{l.lga ? `, ${l.lga}` : ''} · {l.deal_type}
          </p>
        </div>

        <div className="deal-metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          <div className="deal-metric"><b>{l.revenue_band}</b><span>Revenue</span></div>
          <div className="deal-metric"><b>{l.years_operating}</b><span>Years</span></div>
          <div className="deal-metric"><b>{l.staff_range}</b><span>Staff</span></div>
          <div className="deal-metric"><b>₦{l.asking_price}</b><span>Asking Price</span></div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>Business Description</h4>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {l.description}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 0', borderTop: '1px solid var(--line)' }}>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 8 }}>Seller Info</h4>
            <p style={{ fontSize: 14 }}>{l.seller_email}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Seller ID: {l.seller_id}</p>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 8 }}>Documents</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {l.financials_signed_url ? (
                <a href={l.financials_signed_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View Financials</a>
              ) : <span style={{ fontSize: 13, color: 'var(--muted)' }}>No financials uploaded</span>}
              {l.audit_report_signed_url ? (
                <a href={l.audit_report_signed_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View Audit Report</a>
              ) : <span style={{ fontSize: 13, color: 'var(--muted)' }}>No audit report uploaded</span>}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-teal" onClick={onClose}>Close Detail</button>
        </div>
      </div>
    </div>
  )
}
