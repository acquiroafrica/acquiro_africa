import { createAdminClient } from '@/lib/supabase/admin'
import AdminListingsClient from './AdminListingsClient'

export const revalidate = 0

export default async function AdminListings() {
  const supabaseAdmin = createAdminClient()

  const { data: allListings, error: listingsError } = await supabaseAdmin
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  // We can fetch emails for these sellers to display
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
  const users = authData?.users || []

  const mergedListings = await Promise.all((allListings || []).map(async l => {
    const user = users.find(u => u.id === l.seller_id)
    
    let financials_url = null
    let audit_report_url = null

    if (l.financials_url) {
      const { data } = await supabaseAdmin.storage.from('listing-documents').createSignedUrl(l.financials_url, 3600)
      financials_url = data?.signedUrl
    }
    if (l.audit_report_url) {
      const { data } = await supabaseAdmin.storage.from('listing-documents').createSignedUrl(l.audit_report_url, 3600)
      audit_report_url = data?.signedUrl
    }

    return {
      ...l,
      seller_email: user?.email || 'Unknown',
      financials_signed_url: financials_url,
      audit_report_signed_url: audit_report_url
    }
  }))

  return (
    <>
      <h1 className="page-title">Manage Listings</h1>
      <p className="page-sub">Review and approve business listings</p>

      {listingsError && <div className="alert alert-error">Error fetching listings: {listingsError.message}</div>}

      <AdminListingsClient listings={mergedListings} />
    </>
  )
}
