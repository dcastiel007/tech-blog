import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "David's Tech Feed",
  description: 'Daily tech links, summarized by AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}