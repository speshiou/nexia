'use server'

import { flushAllChatHistory } from '../data'

export async function clearChatHistory() {
  console.log('clear chat history')
  await flushAllChatHistory()
}
