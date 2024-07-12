import { Message } from '@/types/collections'
import { ModelType } from '../models'
import * as gemini from './gemini'

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
  generateText: (args: GenAIArgs) => Promise<string>
}

const genAI = {
  gemini: {
    generateText: gemini.generateText,
  },
}

export default genAI
