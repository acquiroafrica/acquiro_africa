'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardShell from '@/components/DashboardShell'
import ListingCard from '@/components/ListingCard'
import type { Listing, Role } from '@/types'

export default function MyOpportunitiesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<Role>('buyer')
  const [listings, setListings] = useState<Listing[]>([])
  const [requests, setRequests] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        
        // Load role
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        if (roleRow) setRole(roleRow.role as Role)

        // Load access requests and joined listings
        const { data: reqs } = await supabase
          .from('access_requests')
          .select(`
            status,
            listing_id,
            listings (*)
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })

        if (reqs) {
          const reqMap: Record<string, string> = {}
          const listingList: Listing[] = []
          
          reqs.forEach((r: any) => {
            reqMap[r.listing_id] = r.status
            if (r.listings) {
              listingList.push(r.listings)
            }
          })
          
          setRequests(reqMap)
          setListings(listingList)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="dashboard-main">Loading opportunities...</div>

  return (
    <DashboardShell role={role} email={user?.email || ''}>
      <h1 className="page-title">My Opportunities</h1>
      <p className="page-sub">Listings you have requested access to and their current status.</p>

      {listings.length > 0 ? (
        <div className="deal-grid">
          {listings.map(l => (
            <ListingCard
              key={l.id}
              listing={l}
              user={user}
              existingRequestStatus={requests[l.id]}
            />
          ))}
        </div>
      ) : (
        <div className="empty" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
          <h3>No interests yet</h3>
          <p>You haven't requested access to any listings yet. Browse the marketplace to find SME opportunities.</p>
          <a href="/opportunities" className="btn btn-teal" style={{ marginTop: 24 }}>
            Browse Opportunities
          </a>
        </div>
      )}
    </DashboardShell>
  )
}
