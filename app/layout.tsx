import './globals.css'
import './styles/prism-theme.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Component Stacks',
  description: 'A collection of reusable components',
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