import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { listing, user, note } = await request.json()

    if (!listing || !user) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'acquiro.africa@gmail.com'
    const resendApiKey = process.env.RESEND_API_KEY

    const emailHtml = `
      <h1>New Access Request</h1>
      <p>A buyer has requested access to an opportunity.</p>
      
      <h2>Opportunity Details</h2>
      <ul>
        <li><strong>Title:</strong> ${listing.title}</li>
        <li><strong>Sector:</strong> ${listing.sector}</li>
        <li><strong>Location:</strong> ${listing.state}${listing.lga ? `, ${listing.lga}` : ''}</li>
        <li><strong>Asking Price:</strong> ${listing.asking_price}</li>
      </ul>

      <h2>Buyer Details</h2>
      <ul>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Name:</strong> ${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}</li>
        <li><strong>Phone:</strong> ${user.user_metadata?.phone_number || 'N/A'}</li>
      </ul>

      ${note ? `<h3>Buyer's Note:</h3><p>${note}</p>` : ''}

      <p><a href="${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '.supabase.co/dashboard/project/')}/admin/users">Manage Access Requests</a></p>
    `

    console.log('--- ADMIN NOTIFICATION ---')
    console.log(`To: ${adminEmail}`)
    console.log(`Subject: New Access Request: ${listing.title}`)
    console.log('---------------------------')

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is missing. Email notification skipped (logged to console above).')
      return NextResponse.json({ 
        success: true, 
        message: 'Notification logged to console (RESEND_API_KEY missing)' 
      })
    }

    // Attempt to send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Acquiro <onboarding@resend.dev>', // Use verified domain once setup: 'Acquiro <notifications@acquiro.africa>'
        to: adminEmail,

        subject: `New Access Request: ${listing.title}`,
        html: emailHtml,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend API error:', data)
      return NextResponse.json({ error: 'Failed to send email via Resend' }, { status: 502 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Notification API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
