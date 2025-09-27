import type { Metadata } from 'next'
import { AuthProvider } from '@/app/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Class Scheduling Platform - Smart Timetable Generator',
  description: 'Advanced timetable generation system for educational institutions with automated scheduling and conflict resolution',
  keywords: 'timetable, scheduling, education, class management, academic planning',
  authors: [{ name: 'Class Scheduling Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Class Scheduling Platform',
    description: 'Smart timetable generation system for educational institutions',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
