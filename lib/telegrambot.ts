import { Context, Markup, Telegraf } from 'telegraf'
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
bot
  .start(async (ctx) => {
    const user = await upsertTelegramUser(ctx)
    if (!user) {
      return
    }
    const i18n = await getDict('en')
    await ctx.replyWithHTML(
      i18n.greeting({
        privacy_link: 'https://nexia.chat/privacy-policy',
        terms_link: 'https://nexia.chat/terms-of-service',
      }),
    )
  })
  .action('balance', async (ctx) => {
    const user = await upsertTelegramUser(ctx)
    if (!user) {
      return
    }

    if (ctx.chat?.type !== 'private') {
      return
    }

    await ctx.answerCbQuery()
    console.log('answerCbQuery')

    const remainingTokens = user.total_tokens - user.used_tokens

    let text = `👛 <b>Balance</b>

<b>${remainingTokens.toLocaleString()}</b> tokens left
<i>You used <b>${user.used_tokens.toLocaleString()}</b> tokens</i>

<b>Tips</b>
- The longer conversation would spend more tokens
- /reset to clear history manually`

    const replyMarkup = Markup.inlineKeyboard([
      Markup.button.webApp(
        '💎 Get more tokens',
        `${process.env.WEB_APP_URL}/purchase?start_for_result=1`,
      ),
    ])

    await ctx.editMessageText(text, {
      reply_markup: replyMarkup.reply_markup,
      parse_mode: 'HTML',
    })
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

  // check flood

  // check timeout

  // check max tokens

  // check balance
  const promptTokenCount = getPromptTokenLength(
    systemPrompt,
    chat.history,
    newMessage,
  )
  let estimatedCost = Math.floor(promptTokenCount * ai.contextCostFactor)
  if (!(await checkBalance(ctx, user as User, estimatedCost))) {
    return
  }

  // generate
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
    num_context_tokens: promptTokenCount,
    num_completion_tokens: completionTokens,
  })

  const finalCost = Math.floor(
    promptTokenCount * ai.contextCostFactor +
      completionTokens * ai.completionCostFactor +
      numProcessedImage * ai.imageInputCostFactor,
  )

  await incUserUsedTokens(user._id, finalCost)
})

async function checkBalance(ctx: Context, user: User, cost: number) {
  const remainingTokens = user.total_tokens - user.used_tokens
  if (remainingTokens < cost) {
    await sendInsufficientTokensWarning(ctx, remainingTokens)
    return false
  }
  return true
}

const sendInsufficientTokensWarning = async (
  ctx: Context,
  requiredTokens?: number,
) => {
  const replyMarkup = Markup.inlineKeyboard([
    Markup.button.callback('👛 Check balance', 'balance'),
  ])

  let text = '⚠️ Insufficient tokens.'
  if (requiredTokens) {
    text += ` Require ${requiredTokens.toLocaleString()} tokens to process this message`
  }

  await ctx.reply(text, { reply_markup: replyMarkup.reply_markup })
}

export default bot
