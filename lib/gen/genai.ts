import { Message } from '@/types/collections'
import { ModelType } from '../models'
import * as gemini from './gemini'
import * as gpt from './gpt'

export interface GenAIArgs {
  systemPrompt?: string
  history: Message[]
  newMessage: {
    text: string
    image?: string
  }
  responseFormat?: 'text' | 'json'
}

interface GenAI {
  generateText: (
    args: GenAIArgs,
  ) => Promise<{ answer: string; completionTokens: number }>
  generateTextStream: (args: GenAIArgs) => AsyncGenerator<string, void, unknown>
  contextCostFactor: number
  completionCostFactor: number
  imageInputCostFactor: number
  maxTokens: number
}

const genAI: { [id: string]: GenAI } = {
  gemini: {
    generateText: async (args) => {
      const answer = await gemini.generateText(args)
      return {
        answer: answer,
        completionTokens: gpt.encoding.encode(answer).length,
      }
    },
    generateTextStream: (args) => {
      const stream = gemini.generateTextStream(args)
      return stream
    },
    contextCostFactor: 3,
    completionCostFactor: 3,
    imageInputCostFactor: 1000,
    // The actual value is 1M, but a limit was imposed to avoid excessive expenses.
    maxTokens: 32768,
  },
}

export function trimHistory(
  systemPrompt: string,
  history: Message[],
  newMessage: string,
  maxTokens: number,
) {
  let promptTokenCount = getPromptTokenLength(systemPrompt, history, newMessage)
  while (promptTokenCount >= maxTokens) {
    history = history.slice(1)
    if (history.length < 1) {
      break
    }
    promptTokenCount = getPromptTokenLength(systemPrompt, history, newMessage)
  }

  return {
    promptTokenCount,
    trimmedHistory: history,
  }
}

export function getTokenLength(text: string) {
  return gpt.encoding.encode(text).length
}

export function getPromptTokenLength(
  systemPrompt: string,
  chatMessages: Message[],
  newMessage: string,
) {
  const messages = gpt.buildHistory(systemPrompt, chatMessages, newMessage)
  return gpt.getTokenLength(messages)
}

export default genAI
