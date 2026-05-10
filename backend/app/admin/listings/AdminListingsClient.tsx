'use client'

import { useState } from 'react'
import type { Listing } from '@/types'
import ApproveButton from './ApproveButton'
import ListingDetailModal from './ListingDetailModal'

interface Props {
  listings: (Listing & { 
    seller_email: string; 
    financials_signed_url?: string; 
    audit_report_signed_url?: string 
  })[]
}

export default function AdminListingsClient({ listings }: Props) {
  const [selectedListing, setSelectedListing] = useState<Props['listings'][0] | null>(null)

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Business Title</th>
              <th>Sector</th>
              <th>Price</th>
              <th>Seller Email</th>
              <th>Status</th>
              <th>Docs</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No listings found.</td>
              </tr>
            ) : (
              listings.map(l => (
                <tr key={l.id}>
                  <td 
                    onClick={() => setSelectedListing(l)}
                    style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--teal)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
                  >
                    <strong>{l.title}</strong>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Click to view details</div>
                  </td>
                  <td>{l.sector}</td>
                  <td>₦{l.asking_price}</td>
                  <td>{l.seller_email}</td>
                  <td>
                    <span className={`tag ${l.status === 'approved' ? 'badge-approved' : l.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {l.financials_signed_url ? (
                        <a href={l.financials_signed_url} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ fontSize: 10, padding: '4px 8px' }}>Financials</a>
                      ) : <span style={{ fontSize: 10, color: 'var(--muted)' }}>No financials</span>}
                      {l.audit_report_signed_url ? (
                        <a href={l.audit_report_signed_url} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ fontSize: 10, padding: '4px 8px' }}>Audit Report</a>
                      ) : <span style={{ fontSize: 10, color: 'var(--muted)' }}>No audit</span>}
                    </div>
                  </td>
                  <td>
                    {l.status === 'pending' ? (
                      <ApproveButton listingId={l.id} />
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>No action</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedListing && (
        <ListingDetailModal 
          listing={selectedListing} 
          onClose={() => setSelectedListing(null)} 
        />
      )}
    </>
  )
}
