import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'
import SellerDashboardClient from './SellerDashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // Buyers should land on their opportunities summary
  if (roleRow?.role === 'buyer') redirect('/my-opportunities')

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardShell role="seller" email={user.email ?? ''}>
      <h1 className="page-title">My Listings</h1>
      <p className="page-sub">Listings you have submitted. New listings are reviewed before going live.</p>

      <SellerDashboardClient listings={listings || []} />
    </DashboardShell>
  )
}
