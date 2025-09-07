import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TamaguiProvider } from './providers/tamagui-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MovieSwipe - Find Your Next Favorite Movie',
  description: 'Swipe through movies and get personalized recommendations based on your preferences',
  keywords: 'movies, recommendations, swipe, tmdb, entertainment',
  authors: [{ name: 'MovieSwipe Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TamaguiProvider>
          {children}
        </TamaguiProvider>
      </body>
    </html>
  )
}