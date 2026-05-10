# Acquiro — Next.js + Supabase

A confidential marketplace for Nigerian SME acquisitions, built with Next.js 14 (App Router) and Supabase.

---

## Features

| Feature | Details |
|---|---|
| **Auth** | Email/password via Supabase Auth |
| **Roles** | Buyer or Seller, selected on sign-up |
| **Listings** | Sellers create listings saved with `status: pending` |
| **Approval flow** | Admin approves listings via Supabase dashboard (or build an admin UI) |
| **Opportunities** | Only `approved` listings shown publicly |
| **Request Access** | Buyers send access requests linked to a listing + user |
| **Buyer Requests** | Buyers submit criteria for businesses not yet listed |

---

## Quick Start

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the schema

In your Supabase project → **SQL Editor**, paste and run the contents of `supabase-schema.sql`.

### 3. Configure auth redirect URLs

In **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Set environment variables

```bash
cp .env.local.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in **Project Settings → API**.

### 5. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
acquiro/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── auth/
│   │   ├── page.tsx              # Login / Sign-up (with role selection)
│   │   ├── callback/route.ts     # Supabase auth callback
│   │   └── signout/route.ts      # Sign-out handler
│   ├── dashboard/
│   │   └── page.tsx              # Seller dashboard — their listings
│   ├── listings/
│   │   └── new/page.tsx          # New listing form (sellers only)
│   └── opportunities/
│       └── page.tsx              # All approved listings
├── components/
│   ├── NavPublic.tsx             # Top navigation
│   ├── DashboardShell.tsx        # Sidebar layout for logged-in users
│   ├── ListingCard.tsx           # Deal card with request access
│   ├── NewListingForm.tsx        # Seller listing form
│   └── BuyerRequestModal.tsx     # "Submit a business request" modal
├── lib/supabase/
│   ├── client.ts                 # Browser Supabase client
│   └── server.ts                 # Server Supabase client
├── types/index.ts                # TypeScript interfaces + constants
├── middleware.ts                 # Route protection
└── supabase-schema.sql           # Full DB schema with RLS policies
```

---

## Database Tables

| Table | Purpose |
|---|---|
| `user_roles` | Maps `user_id` → `buyer` \| `seller` \| `admin` |
| `listings` | Business listings with `status: pending \| approved \| rejected` |
| `access_requests` | Buyer interest in a specific listing |
| `buyer_requests` | Buyer criteria for unlisted businesses |

All tables have **Row Level Security** enabled.

---

## Approving Listings (Admin)

Currently, listing approval is done directly in Supabase:

1. Go to **Table Editor → listings**
2. Find the listing with `status = pending`
3. Click the row and change `status` to `approved`

To build an admin UI, add a `/admin` route protected by `role = 'admin'` and use the Supabase **service role key** (server-side only) to update listings.

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Add the same environment variables in your Vercel project settings. Update the Supabase redirect URLs to include your production domain.

---

## Tech Stack

- **Next.js 14** — App Router, Server Components, Server Actions
- **Supabase** — Auth, PostgreSQL, RLS
- **TypeScript**
- **CSS** — Custom properties, no UI library (zero dependencies on component libs)
