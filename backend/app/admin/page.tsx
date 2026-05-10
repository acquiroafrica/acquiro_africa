import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 0 // always fetch latest

export default async function AdminOverview() {
  const supabaseAdmin = createAdminClient()

  // Fetch counts


  const { count: totalSellers } = await supabaseAdmin
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'seller')

  const { count: totalBuyers } = await supabaseAdmin
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'buyer')

  const { count: pendingListings } = await supabaseAdmin
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: pendingAccess } = await supabaseAdmin
    .from('access_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: pendingMandates } = await supabaseAdmin
    .from('buyer_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')


  return (
    <>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-sub">Platform Overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-head)' }}>
            {(totalSellers || 0) + (totalBuyers || 0)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Total Users</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-head)' }}>
            {totalSellers || 0}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Sellers</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-head)' }}>
            {totalBuyers || 0}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Buyers</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold-2)', fontFamily: 'var(--font-head)' }}>
            {pendingListings || 0}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Pending Listings</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-head)' }}>
            {(pendingAccess || 0) + (pendingMandates || 0)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Pending Requests</div>
        </div>
      </div>
    </>
  )
}
