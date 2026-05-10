import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/repair-profile
 * Backfills a missing user_roles row for a user that already exists in auth.users.
 * Uses service role to bypass RLS.
 * Body: { userId: string, role?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Fetch the auth user to get their metadata
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'User not found in auth' }, { status: 404 })
    }

    const user = userData.user
    const meta = user.user_metadata ?? {}

    const resolvedRole = role || meta.role || 'buyer'

    // Check if a row already exists
    const { data: existing } = await adminClient
      .from('user_roles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true, message: 'Profile row already exists', existing: true })
    }

    // Insert the missing row
    const { error: insertError } = await adminClient.from('user_roles').insert({
      user_id: userId,
      role: resolvedRole,
      first_name: meta.first_name ?? null,
      last_name: meta.last_name ?? null,
      phone_number: meta.phone_number ?? null,
    })

    if (insertError) {
      console.error('repair-profile insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, role: resolvedRole })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('repair-profile route error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
