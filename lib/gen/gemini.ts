import { Message } from '@/types/collections'
import { Content, ModelParams, Part, VertexAI } from '@google-cloud/vertexai'
import { GenAIArgs } from './genai'

export function buildHistory(history: Message[]) {
  const contents: Content[] = []

  for (const message of history) {
    contents.push({ role: 'user', parts: [{ text: message.user }] })
    contents.push({ role: 'model', parts: [{ text: message.bot }] })
  }

  return contents
}

export function getGenModel(args: GenAIArgs) {
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
  return generativeModel
}

export function buildContent(content: { text: string; image?: string }) {
  const { text, image } = content
  const parts: Part[] = [{ text: text }]
  if (image) {
    parts.push({
      inlineData: {
        data: image,
        mimeType: 'image/jpeg',
      },
    })
  }
  return { role: 'user', parts: parts }
}

export async function generateText(args: GenAIArgs) {
  const generativeModel = getGenModel(args)

  const contents = buildHistory(args.history)
  const newContent = buildContent(args.newMessage)

  contents.push(newContent)

  const resp = await generativeModel.generateContent({
    contents: contents,
  })

  if (args.responseFormat == 'json') {
    return JSON.parse(resp.response.candidates![0].content.parts[0].text!)
  } else {
    return resp.response.candidates![0].content.parts[0].text!
  }
}

export async function* generateTextStream(args: GenAIArgs) {
  const generativeModel = getGenModel(args)

  const contents = buildHistory(args.history)
  const newContent = buildContent(args.newMessage)

  contents.push(newContent)
  const resp = await generativeModel.generateContentStream({
    contents: contents,
  })

  for await (const item of resp.stream) {
    yield item.candidates![0].content.parts[0].text!
  }
}
