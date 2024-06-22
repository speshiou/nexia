import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../globals.css'
import { TelegramProvider } from '@/components/webapp/telegram-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Settings | Nexia',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
      <body className={`${inter.className}`}>
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  )
}
