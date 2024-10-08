import OpenAI from 'openai'
import { Message } from '@/types/collections'
import { encodingForModel } from 'js-tiktoken'
import { GenAIArgs } from './genai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

export const encoding = encodingForModel('gpt-4')

export function buildHistory(
  systemPrompt: string,
  chatMessages: Message[],
  newMessage?: string,
) {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ]

  // Add chat context
  if (chatMessages.length > 0) {
    for (const message of chatMessages) {
      let role: 'function' | 'system' | 'user' | 'assistant' | 'tool' = 'user'
      switch (message.role) {
        case 'user':
          role = 'user'
          break
        case 'system':
          role = 'system'
          break
        case 'model':
          role = 'assistant'
          break
      }
      messages.push({
        role: role,
        content: message.content,
      })
    }
  }

  if (newMessage) {
    messages.push({
      role: 'user',
      content: newMessage,
    })
  }

  return messages
}

export function getTokenLength(messages: ChatCompletionMessageParam[]) {
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

export async function* generateTextStream(args: GenAIArgs) {
  const messages = buildHistory(
    args.systemPrompt || '',
    args.history,
    args.newMessage.text,
  )

  const openai = new OpenAI()
  const stream = await openai.chat.completions.create({
    model: args.model || 'gpt-3.5-turbo',
    messages: messages,
    stream: true,
  })

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || ''
  }
}
