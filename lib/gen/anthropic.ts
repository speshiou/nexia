import Anthropic from '@anthropic-ai/sdk'
import { GenAIArgs } from './genai'
import { Message } from '@/types/collections'

const MODEL = 'claude-3-haiku-20240307'

const anthropic = new Anthropic()

export function buildHistory(history: Message[]) {
  const contents: Anthropic.Messages.MessageParam[] = []
  let role: 'user' | 'assistant' = 'user'
  for (const message of history) {
    switch (message.role) {
      case 'user':
        role = 'user'
        break
      case 'system':
        role = 'assistant'
        break
      case 'model':
        role = 'assistant'
        break
    }

    contents.push({ role: role, content: message.content })
  }

  return contents
}

export async function* generateTextStream(args: GenAIArgs) {
  const messages = buildHistory(args.history)
  if (args.newMessage) {
    messages.push({ role: 'user', content: args.newMessage.text })
  }

  const stream = await anthropic.messages.create({
    max_tokens: 1024,
    system: args.systemPrompt,
    messages: messages,
    model: MODEL,
    stream: true,
  })
  for await (const messageStreamEvent of stream) {
    switch (messageStreamEvent.type) {
      case 'content_block_delta':
        switch (messageStreamEvent.delta.type) {
          case 'text_delta':
            const text = messageStreamEvent.delta.text
            yield text
            break
          default:
            break
        }
        break

      default:
        break
    }
  }
}
