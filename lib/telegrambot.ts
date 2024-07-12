import { Context, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { getDict } from './utils'
import {
  upsertChat,
  incStats,
  pushChatHistory,
  incUserUsedTokens,
} from './data'
import genAI, { getPromptTokenLength } from './gen/genai'
import { upsertTelegramUser } from './actions'
import { User } from '@/types/collections'

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_TOKEN || '')
// middleware
bot.use(async (ctx, next) => {
  console.time(`Processing update ${ctx.update.update_id}`)
  await next() // runs next middleware
  // runs after next middleware finishes
  await incStats('messages')
  console.timeEnd(`Processing update ${ctx.update.update_id}`)
})
bot.start(async (cxt) => {
  const i18n = await getDict('en')
  await cxt.replyWithHTML(
    i18n.greeting({
      privacy_link: 'https://nexia.chat/privacy-policy',
      terms_link: 'https://nexia.chat/terms-of-service',
    }),
  )
})
bot.on(message('text'), async (ctx) => {
  const user = await upsertTelegramUser(ctx)
  if (!user) {
    return
  }
  const chat = await upsertChat(process.env.TELEGRAM_BOT_NAME!, ctx.chat.id, {})
  if (!chat) {
    return
  }
  console.log(user)
  console.log(chat)
  const model = 'gemini'
  const systemPrompt = ''
  const newMessage = ctx.message.text
  const ai = genAI[model]
  const numProcessedImage = 0

  const promptTokenCount = getPromptTokenLength(
    systemPrompt,
    chat.history,
    newMessage,
  )
  let estimatedCost = Math.floor(promptTokenCount * ai.contextCostFactor)
  if (!(await checkBalance(ctx, user as User, estimatedCost))) {
    return
  }

  const { answer, completionTokens } = await ai.generateText({
    newMessage: {
      text: newMessage,
    },
    history: chat?.history || [],
  })
  await ctx.reply(answer)

  await pushChatHistory(process.env.TELEGRAM_BOT_NAME!, ctx.chat.id, {
    bot: answer,
    user: newMessage,
    date: new Date(),
    num_completion_tokens: 0,
    num_context_tokens: 0,
  })

  const finalCost = Math.floor(
    promptTokenCount * ai.contextCostFactor +
      completionTokens * ai.completionCostFactor +
      numProcessedImage * ai.imageInputCostFactor,
  )

  await incUserUsedTokens(user._id, finalCost)
})

async function checkBalance(ctx: Context, user: User, cost: number) {
  return true
}

export default bot
