import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'New Beginning Budget Planner',
  description: 'A comprehensive budget planning and financial management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}
