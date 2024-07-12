import { Message } from '@/types/collections'
import { Content, ModelParams, VertexAI } from '@google-cloud/vertexai'
import { GenAIArgs } from './genai'

export function buildHistory(history: Message[]) {
  const contents: Content[] = []

  for (const message of history) {
    contents.push({ role: 'user', parts: [{ text: message.user }] })
    contents.push({ role: 'model', parts: [{ text: message.bot }] })
  }

  return contents
}

export async function generateText(args: GenAIArgs) {
  const contents = buildHistory(args.history)
  const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID!,
    location: 'us-central1',
  })

  const params: ModelParams = {
    model: 'gemini-1.5-pro-001',
  }

  if (args.responseFormat == 'json') {
    params.generationConfig = {
      responseMimeType: 'application/json',
    } as any
  }

  if (args.systemPrompt) {
    params.systemInstruction = {
      role: 'system',
      parts: [{ text: args.systemPrompt }],
    }
  }

  const generativeModel = vertexAI.getGenerativeModel(params)

  contents.push({ role: 'user', parts: [{ text: args.newMessage.text }] })

  const resp = await generativeModel.generateContent({
    contents: contents,
  })

  if (args.responseFormat == 'json') {
    return JSON.parse(resp.response.candidates![0].content.parts[0].text!)
  } else {
    return resp.response.candidates![0].content.parts[0].text!
  }
}
