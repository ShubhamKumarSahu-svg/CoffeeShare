import React from 'react'
import Footer from '../components/Footer'
import '../styles.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { ModeToggle } from '../components/ModeToggle'
import CoffeeShareQueryClientProvider from '../components/QueryClientProvider'
import { Metadata, Viewport } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'CoffeeShare | peer-to-peer file sharing',
  description:
    'Peer-to-peer file sharing in your browser: encrypted direct transfer, password protection, one-time links, and live chat.',
  alternates: {
    canonical: 'https://coffeeshare.app',
  },
  openGraph: {
    url: 'https://coffeeshare.app',
    title: 'CoffeeShare | peer-to-peer file sharing',
    description:
      'Encrypted direct browser-to-browser transfer with password lock and one-time links.',
    images: [{ url: '/images/share-card.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoffeeShare | peer-to-peer file sharing',
    description:
      'Encrypted direct browser-to-browser transfer with password lock and one-time links.',
    images: ['/images/share-card.png'],
  },
  icons: {
    icon: '/image.png',
    shortcut: '/image.png',
    apple: '/image.png',
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
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CoffeeShare',
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Peer-to-peer file sharing app with end-to-end encryption, password-protected links, and one-time burn-after-pour shares.',
    url: 'https://coffeeshare.app',
  }

  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </head>
        <body>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <CoffeeShareQueryClientProvider>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
              />
              <div className="flex flex-col min-h-screen w-full">
                <main className="flex-1 flex flex-col w-full">{children}</main>
                <Footer />
              </div>
              <ModeToggle />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '4px solid var(--border-strong)',
                    boxShadow: '4px 4px 0px 0px var(--shadow-color)',
                    borderRadius: 0,
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
// .
// .
