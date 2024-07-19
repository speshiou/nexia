export const models = {
  gpt4: {
    id: 'gpt4',
    title: 'GPT-4o',
    caption: 'OpenAI',
  },
  gemini: {
    id: 'gemini',
    title: 'Gemini Pro Vision',
    caption: 'Google',
  },
}

export type ModelType = keyof typeof models

export const defaultModelId = 'gpt4'
