import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, first_name, last_name, phone_number } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Create the auth user using the admin client
    //    This bypasses email confirmation so the user can log in immediately.
    //    Remove `emailRedirectTo` if you want to keep email confirmation enabled.
    const { data: authData, error: signUpError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so they don't need to click email link
      user_metadata: {
        role,
        first_name,
        last_name,
        phone_number,
      },
    })

    if (signUpError || !authData.user) {
      console.error('Auth signup error:', signUpError)
      return NextResponse.json(
        { error: signUpError?.message ?? 'Failed to create user' },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // 2. Upsert the user_roles record using service role (bypasses RLS entirely)
    const { error: roleError } = await adminClient
      .from('user_roles')
      .upsert(
        {
          user_id: userId,
          role,
          first_name,
          last_name,
          phone_number,
        },
        { onConflict: 'user_id' }
      )

    if (roleError) {
      console.error('Failed to insert user_roles row:', roleError)
      // Don't fail the whole request – the DB trigger may have already handled it.
      // Return a warning but still treat as success.
    }

    return NextResponse.json({
      success: true,
      userId,
      warning: roleError ? 'Profile row could not be created; please contact support.' : null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('Register route error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
