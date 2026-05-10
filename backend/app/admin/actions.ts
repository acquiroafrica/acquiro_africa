'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function approveListing(listingId: string) {
  // First, verify the user making the request is an admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleRow?.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  // If verified, use the admin client to bypass RLS and update the listing
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from('listings')
    .update({ status: 'approved' })
    .eq('id', listingId)

  if (error) {
    console.error('Error approving listing:', error)
    throw new Error('Failed to approve listing')
  }

  revalidatePath('/admin/listings')
  revalidatePath('/opportunities')
  revalidatePath('/dashboard')
}

export async function updateAccessRequestStatus(requestId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleRow?.role !== 'admin') throw new Error('Forbidden')

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from('access_requests')
    .update({ status })
    .eq('id', requestId)

  if (error) throw error
  revalidatePath('/admin/requests')
}

export async function updateBuyerMandateStatus(requestId: string, status: 'pending' | 'reviewed') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleRow?.role !== 'admin') throw new Error('Forbidden')

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from('buyer_requests')
    .update({ status })
    .eq('id', requestId)

  if (error) throw error
  revalidatePath('/admin/requests')
}

