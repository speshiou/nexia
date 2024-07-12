import { Message } from '@/types/collections'
import { encodingForModel } from 'js-tiktoken'

interface GPTMessage {
  role: string
  content: string
}

export const encoding = encodingForModel('gpt-4')

export function buildHistory(
  systemPrompt: string,
  chatMessages: Message[],
  newMessage: string,
) {
  const messages: GPTMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ]

  // Add chat context
  if (chatMessages.length > 0) {
    for (const message of chatMessages) {
      messages.push({
        role: 'user',
        content: message.user,
      })
      messages.push({
        role: 'assistant',
        content: message.bot,
      })
    }
  }

  // Current message
  messages.push({
    role: 'user',
    content: newMessage,
  })

  return messages
}

export function getTokenLength(messages: GPTMessage[]) {
  const tokensPerMessage = 3
  const tokensPerName = 1
  let numTokens: number = 0

  for (const message of messages) {
    numTokens += tokensPerMessage

    for (const [key, value] of Object.entries(message)) {
      numTokens += encoding.encode(value).length // Assuming the value is a string for encoding
      if (key === 'name') {
        numTokens += tokensPerName
      }
    }
  }

  numTokens += 3 // Every reply is primed with "<|start|>assistant<|message|>"
  return numTokens
}
