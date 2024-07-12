import { Context, Markup, Telegraf } from 'telegraf'
import { Message } from 'telegraf/types'
import { message } from 'telegraf/filters'
import { getDict } from './utils'
import {
  upsertChat,
  incStats,
  pushChatHistory,
  incUserUsedTokens,
} from './data'
import genAI, { trimHistory } from './gen/genai'
import { resolveModel, resolveRole, upsertTelegramUser } from './actions'
import { User } from '@/types/collections'

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_TOKEN || '')
// middleware
bot
  .use(async (ctx, next) => {
    console.time(`Processing update ${ctx.update.update_id}`)
    await next() // runs next middleware
    // runs after next middleware finishes
    await incStats('messages')
    console.timeEnd(`Processing update ${ctx.update.update_id}`)
  })
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

  const model = await resolveModel(chat.current_model)
  const role = await resolveRole(user._id, chat.current_chat_mode, true)
  const systemPrompt = role.prompt || ''
  const newMessage = ctx.message.text
  const ai = genAI[model]
  let numProcessedImage = 0
  let base64Image: string | undefined = undefined

  // check flood

  // check timeout

  // reply to photo
  if (ctx.message.reply_to_message && 'photo' in ctx.message.reply_to_message) {
    const photoMessage = ctx.message.reply_to_message as Message.PhotoMessage
    const photo = photoMessage.photo
    const photoFileId = photo[photo.length - 1].file_id // Get the largest size photo
    try {
      // Get the file information
      const file = await ctx.telegram.getFile(photoFileId)
      const filePath = file.file_path

      // Construct the URL to download the file
      const photoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_API_TOKEN}/${filePath}`

      // Use fetch to download the photo
      const response = await fetch(photoUrl)
      const arrayBuffer = await response.arrayBuffer()
      base64Image = Buffer.from(arrayBuffer).toString('base64')
      numProcessedImage++

      // You can then use this URL to download the photo
    } catch (error) {
      console.error('Error retrieving the photo:', error)
    }
  }

  // check max tokens
  const { promptTokenCount, trimmedHistory } = trimHistory(
    systemPrompt,
    chat.history,
    newMessage,
    ai.maxTokens,
  )

  // check balance
  let estimatedCost = Math.floor(promptTokenCount * ai.contextCostFactor)
  if (!(await checkBalance(ctx, user as User, estimatedCost))) {
    return
  }

  // generate
  const { answer, completionTokens } = await ai.generateText({
    systemPrompt: systemPrompt,
    newMessage: {
      text: newMessage,
      image: base64Image,
    },
    history: trimmedHistory,
  })
  await ctx.reply(answer)

  const maxHistoryCount = trimmedHistory.length + 1

  await pushChatHistory(
    process.env.TELEGRAM_BOT_NAME!,
    ctx.chat.id,
    {
      bot: answer,
      user: newMessage,
      date: new Date(),
      num_context_tokens: promptTokenCount,
      num_completion_tokens: completionTokens,
    },
    maxHistoryCount,
  )

  const finalCost = Math.floor(
    promptTokenCount * ai.contextCostFactor +
      completionTokens * ai.completionCostFactor +
      numProcessedImage * ai.imageInputCostFactor,
  )

  console.log(`finalCost: ${finalCost}`)
  await incUserUsedTokens(user._id, finalCost)
})

async function checkBalance(ctx: Context, user: User, cost: number) {
  const remainingTokens = user.total_tokens - user.used_tokens
  if (remainingTokens < cost) {
    await sendInsufficientTokensWarning(ctx, cost)
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
