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
  contextCostFactor: number
  completionCostFactor: number
  imageInputCostFactor: number
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
    contextCostFactor: 3,
    completionCostFactor: 3,
    imageInputCostFactor: 1000,
  },
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
