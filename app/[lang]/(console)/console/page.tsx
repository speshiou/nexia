'use client'

import { clearChatHistory } from '@/lib/admin/actions'

export default function Page() {
  return (
    <form action={clearChatHistory}>
      <button>Clear Chat History</button>
    </form>
  )
}
