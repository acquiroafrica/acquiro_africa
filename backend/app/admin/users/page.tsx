import { createAdminClient } from '@/lib/supabase/admin'
import UserProfilesClient from './UserProfilesClient'

export const revalidate = 0

export default async function AdminUsers() {
  const supabaseAdmin = createAdminClient()

  // Fetch all auth users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  const users = authData?.users || []

  // Fetch all user roles
  const { data: rolesData, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('*')

  // Merge the data
  const mergedUsers = users.map(u => {
    const roleRow = rolesData?.find(r => r.user_id === u.id)
    return {
      id: u.id,
      email: u.email,
      role: roleRow?.role || 'N/A',
      created_at: new Date(u.created_at).toLocaleDateString(),
      name: (roleRow?.first_name || roleRow?.last_name) 
        ? `${roleRow.first_name || ''} ${roleRow.last_name || ''}`.trim() 
        : (u.user_metadata?.name || 'N/A'),
      phone: roleRow?.phone_number || u.phone || 'N/A'
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <>
      <h1 className="page-title">User Profiles</h1>
      <p className="page-sub">View, search, and manage user profiles on the platform</p>

      {authError && <div className="alert alert-error">Error fetching users: {authError.message}</div>}

      <UserProfilesClient users={mergedUsers} />
    </>
  )
}
