import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewListingForm from '@/components/NewListingForm'
import DashboardShell from '@/components/DashboardShell'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  let userRole = roleRow?.role

  if (!userRole) {
    // If role is missing (e.g. signup RLS issue), assign seller role since they are trying to list a business
    const { error } = await supabase.from('user_roles').insert({ user_id: user.id, role: 'seller' })
    if (!error) userRole = 'seller'
  }

  if (userRole !== 'seller') redirect('/opportunities')

  return (
    <DashboardShell role="seller" email={user.email ?? ''}>
      <h1 className="page-title">Create a Listing</h1>
      <p className="page-sub">Your listing will be reviewed before it becomes visible to buyers. All information is kept confidential.</p>
      <div style={{ maxWidth: 680 }}>
        <NewListingForm sellerId={user.id} />
      </div>
    </DashboardShell>
  )
}
