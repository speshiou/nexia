'use client'

import Placeholder from '@/components/webapp/placeholder'
import { TelegramProvider } from '@/components/webapp/telegram-provider'

export default function Page() {
  return (
    <TelegramProvider>
      <Placeholder />
    </TelegramProvider>
  )
}
