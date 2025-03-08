import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Components Stacks',
  description: 'A modern Next.js application with various component stacks',
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