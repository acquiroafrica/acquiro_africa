import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/types'
import NavPublic from '@/components/NavPublic'
import ListingCard from '@/components/ListingCard'
import BuyerRequestModal from '@/components/BuyerRequestModal'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="shell">
      <NavPublic user={user} />

      {/* ── Hero ─────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="eyebrow">Buy and sell Nigerian businesses</p>
            <h1>A confidential marketplace for serious SME buyers and sellers.</h1>
            <p className="lead">
              Acquiro helps business owners explore exits, acquisitions, investments, and
              partnerships with qualified counterparties. Sellers stay protected. Buyers get
              cleaner, more structured deal flow.
            </p>
            <div className="hero-actions">
              <a href={user ? '/listings/new' : '/auth?role=seller'} className="btn btn-gold">
                List your business
              </a>
              <a href={user ? '/opportunities' : '/auth?role=buyer'} className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>
                Request buyer access
              </a>
            </div>
          </div>
          <aside>
            <div className="hero-card">
              <h2>Built for considered transactions.</h2>
              <div className="signal"><span>For sellers</span><b>Confidential listings</b></div>
              <div className="signal"><span>For buyers</span><b>Reviewed deal flow</b></div>
              <div className="signal"><span>Access</span><b>NDA before details</b></div>
              <div className="signal"><span>Support</span><b>Guided process</b></div>
            </div>
          </aside>
        </div>
        <div className="trust-strip">
          <div><b>Confidential</b><span>Seller identity protected</span></div>
          <div><b>Reviewed</b><span>Profiles checked first</span></div>
          <div><b>Structured</b><span>Clear transaction steps</span></div>
          <div><b>Local</b><span>Built for Nigerian SMEs</span></div>
        </div>
      </section>

      {/* ── For Sellers ───────────────────────── */}
      <section className="section" id="sellers">
        <div className="section-head">
          <div>
            <h2>For business owners thinking about what comes next.</h2>
            <p>Whether you want a full sale, partial sale, investment partner, merger, or succession option,
              Acquiro helps you present your business without immediately exposing sensitive information.</p>
          </div>
          <a href={user ? '/listings/new' : '/auth?role=seller'} className="btn btn-gold">
            Start seller request
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
          {[
            { n: '01', tag: 'Protect identity', title: 'Stay confidential while interest is tested', body: 'Your business can be shown by sector, location, revenue range, and deal type before your name or deeper details are shared.' },
            { n: '02', tag: 'Show value', title: 'Present the business professionally', body: 'Structured profiles help buyers understand revenue, operations, staff, assets, customer base, and reason for transaction.' },
            { n: '03', tag: 'Choose pace', title: 'Control the next step', body: 'Interest does not mean disclosure. Deeper conversations happen only after review, fit, and NDA.' },
          ].map(c => (
            <article key={c.n} className="card">
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--teal-3)', marginBottom: 12, fontFamily: 'var(--font-head)' }}>{c.n}</div>
              <span className="tag" style={{ marginBottom: 12, display: 'inline-block' }}>{c.tag}</span>
              <h3 style={{ marginBottom: 10, fontSize: '1.05rem' }}>{c.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Live Opportunities ─────────────────── */}
      <section className="section" id="deals">
        <div className="section-head">
          <div>
            <h2>Current opportunities.</h2>
            <p>Approved listings are shown with limited detail. Deeper financials and seller identity are shared only after review and NDA.</p>
          </div>
          <a href="/opportunities" className="btn btn-ghost">View all</a>
        </div>
        {listings && listings.length > 0 ? (
          <div className="deal-grid">
            {(listings as Listing[]).slice(0, 6).map(l => (
              <ListingCard key={l.id} listing={l} user={user} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No listings yet</h3>
            <p>Approved opportunities will appear here. Check back soon.</p>
          </div>
        )}
      </section>

      {/* ── How it works ──────────────────────── */}
      <section className="band" id="trust">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <h2>How the process works.</h2>
              <p style={{ color: 'rgba(255,255,255,.65)', marginTop: 10 }}>Designed for trust-heavy transactions where both sides need enough information to assess fit without exposing too much too early.</p>
            </div>
          </div>
          <div className="steps">
            {[
              { title: 'Submit request', body: 'Sellers submit a business profile. Buyers submit acquisition or investment criteria.' },
              { title: 'Review fit', body: 'Acquiro reviews the request and determines whether there is enough information to proceed.' },
              { title: 'Share safely', body: 'Business identity and deeper financials remain protected until the right access step.' },
              { title: 'Open conversation', body: 'Qualified buyer and seller conversations move forward through a structured path.' },
            ].map(s => (
              <article key={s.title} className="step">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Buyer request CTA ─────────────────── */}
      <section className="section">
        <div style={{ background: 'var(--teal-3)', borderRadius: 16, padding: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginBottom: 10 }}>Can't find what you're looking for?</h2>
            <p style={{ color: 'var(--muted)' }}>Tell us the business type you want to acquire. We'll match you when the right opportunity comes up.</p>
          </div>
          <BuyerRequestModal user={user} />
        </div>
      </section>

      <footer className="footer">
        <strong>Acquiro</strong>
        <span>Confidential business sales, acquisitions, and investment conversations for Nigerian SMEs.</span>
      </footer>
    </div>
  )
}
