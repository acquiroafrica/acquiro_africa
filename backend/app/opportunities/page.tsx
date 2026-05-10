import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Listing, Role } from '@/types'
import NavPublic from '@/components/NavPublic'
import ListingCard from '@/components/ListingCard'
import DashboardShell from '@/components/DashboardShell'

export const revalidate = 60

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?role=buyer')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleRow?.role !== 'buyer' && roleRow?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  // Fetch user's existing access requests to show status
  let myRequests: Record<string, string> = {}
  if (user) {
    const { data: reqs } = await supabase
      .from('access_requests')
      .select('listing_id, status')
      .eq('buyer_id', user.id)
    if (reqs) {
      reqs.forEach(r => { myRequests[r.listing_id] = r.status })
    }
  }

  const content = (
    <div className="section" style={user ? { padding: '0 0 80px' } : {}}>
      <div className="section-head">
        <div>
          <h2>Current Opportunities</h2>
          <p>All listings are shown with limited information. Deeper financials and seller identity are shared only after access is granted.</p>
        </div>
        {!user && (
          <a href="/auth?role=buyer" className="btn btn-teal">Sign in to request access</a>
        )}
      </div>

      {listings && listings.length > 0 ? (
        <div className="deal-grid">
          {(listings as Listing[]).map(l => (
            <ListingCard
              key={l.id}
              listing={l}
              user={user}
              existingRequestStatus={myRequests[l.id]}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>No opportunities listed yet</h3>
          <p>Check back soon — new opportunities are reviewed and added regularly.</p>
        </div>
      )}
    </div>
  )

  if (user && (roleRow?.role === 'buyer' || roleRow?.role === 'admin')) {
    return (
      <DashboardShell role={(roleRow?.role as Role) || 'buyer'} email={user.email || ''}>
        {content}
      </DashboardShell>
    )
  }

  return (
    <div className="shell">
      <NavPublic user={user} />
      {content}
      <footer className="footer">
        <strong>Acquiro</strong>
        <span>Confidential business transactions for Nigerian SMEs.</span>
      </footer>
    </div>
  )
}
