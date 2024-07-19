import Anthropic from '@anthropic-ai/sdk'
import { GenAIArgs } from './genai'
import { Message } from '@/types/collections'

const MODEL = 'claude-3-haiku-20240307'

const anthropic = new Anthropic()

export function buildHistory(history: Message[]) {
  const contents: Anthropic.Messages.MessageParam[] = []

  for (const message of history) {
    contents.push({ role: 'user', content: message.user })
    contents.push({ role: 'assistant', content: message.bot })
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
  for await (const chunk of stream) {
    console.log(chunk)
    yield 'test '
  }
}
