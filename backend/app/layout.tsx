import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Acquiro | Buy and Sell Nigerian Businesses',
  description:
    'Acquiro helps Nigerian business owners find qualified buyers and helps buyers discover verified, cash-flowing SME opportunities.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
