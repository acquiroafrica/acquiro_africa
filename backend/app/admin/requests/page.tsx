import { createAdminClient } from '@/lib/supabase/admin'
import RequestsClient from './RequestsClient'

export const revalidate = 0

export default async function AdminRequests() {
  const supabaseAdmin = createAdminClient()

  // 1. Fetch Access Requests
  const { data: accessRequests } = await supabaseAdmin
    .from('access_requests')
    .select(`
      *,
      listings (title)
    `)
    .order('created_at', { ascending: false })

  // 2. Fetch Buyer Mandates (buyer_requests)
  const { data: buyerMandates } = await supabaseAdmin
    .from('buyer_requests')
    .select('*')
    .order('created_at', { ascending: false })

  // 3. Fetch User Roles for mapping names
  const { data: roles } = await supabaseAdmin
    .from('user_roles')
    .select('*')

  // 4. Fetch Auth Users for emails
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
  const authUsers = authData?.users || []

  // Helper to get info
  const getUserInfo = (userId: string) => {
    const role = roles?.find(r => r.user_id === userId)
    const authUser = authUsers.find(u => u.id === userId)
    return {
      name: role ? `${role.first_name || ''} ${role.last_name || ''}`.trim() || 'N/A' : 'N/A',
      phone: role?.phone_number || 'N/A',
      email: authUser?.email || 'N/A'
    }
  }


  const mergedAccess = (accessRequests || []).map(ar => ({
    ...ar,
    listing_title: (ar.listings as any)?.title || 'Unknown Listing',
    buyer_name: getUserInfo(ar.buyer_id).name,
    buyer_phone: getUserInfo(ar.buyer_id).phone,
    buyer_email: getUserInfo(ar.buyer_id).email
  }))

  const mergedMandates = (buyerMandates || []).map(bm => ({
    ...bm,
    buyer_name: getUserInfo(bm.buyer_id).name,
    buyer_phone: getUserInfo(bm.buyer_id).phone,
    buyer_email: getUserInfo(bm.buyer_id).email
  }))


  return (
    <>
      <h1 className="page-title">Buyer Requests</h1>
      <p className="page-sub">Manage opportunity access and general buyer interest mandates.</p>
      
      <RequestsClient 
        accessRequests={mergedAccess} 
        buyerMandates={mergedMandates} 
      />
    </>
  )
}
