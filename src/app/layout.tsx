import React from 'react'
import Footer from '../components/Footer'
import '../styles.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { ModeToggle } from '../components/ModeToggle'
import CoffeeShareQueryClientProvider from '../components/QueryClientProvider'
import { Viewport } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'CoffeeShare — Brew & send files, peer-to-peer.',
  description:
    'Free peer-to-peer file transfers in your browser — no upload limits, no sign-up required. Powered by WebRTC.',
  charSet: 'utf-8',
  openGraph: {
    url: 'https://coffeeshare.app',
    title: 'CoffeeShare — Brew & send files, peer-to-peer.',
    description:
      'Free peer-to-peer file transfers in your browser — no upload limits, no sign-up required.',
    images: [{ url: '/images/fb.png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CoffeeShareQueryClientProvider>
              <main>{children}</main>
              <Footer />
              <ModeToggle />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#1C1917',
                    color: '#F5F5F4',
                    border: '1px solid rgba(255,255,255,0.05)',
                  },
                }}
              />
            </CoffeeShareQueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
