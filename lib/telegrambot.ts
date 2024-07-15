import { Context, Markup, Telegraf } from 'telegraf'
import { Message } from 'telegraf/types'
import { message } from 'telegraf/filters'
import { getDict } from './utils'
import {
  upsertChat,
  incStats,
  pushChatHistory,
  incUserUsedTokens,
  updateChat,
} from './data'
import genAI, { getTokenLength, trimHistory } from './gen/genai'
import { resolveModel, resolveRole, upsertTelegramUser } from './actions'
import { User } from '@/types/collections'
import { CHAT_TIMEOUT, TELEGRAM_MAX_MESSAGE_LENGTH } from './constants'
import { models } from './models'

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
  const i18n = await getDict('en')

  const modelId = await resolveModel(chat.current_model)
  const model = models[modelId]
  const role = await resolveRole(user._id, chat.current_chat_mode, true)
  const systemPrompt = role.prompt || ''
  const newMessage = ctx.message.text
  const ai = genAI[modelId]
  let numProcessedImage = 0
  let base64Image: string | undefined = undefined

  // check flood

  // check timeout
  const chatTimeDiff = Math.abs(
    (new Date().getTime() - chat.last_interaction.getTime()) / 1000,
  )
  if (chatTimeDiff > CHAT_TIMEOUT) {
    // clear chat history
    const result = await updateChat(
      process.env.TELEGRAM_BOT_NAME!,
      ctx.chat.id,
      {
        history: [],
      },
    )
    if (result) {
      ctx.sendMessage(
        i18n.currentChatStatusPattern({
          role_name: role.name,
          mode_name: model.title,
        }),
        {
          parse_mode: 'HTML',
        },
      )
    }
  }

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

  await ctx.sendChatAction('typing')

  // generate
  const stream = ai.generateTextStream({
    systemPrompt: systemPrompt,
    newMessage: {
      text: newMessage,
      image: base64Image,
    },
    history: trimmedHistory,
  })

  let messageChuckIndex = 0
  let lastMessageChuckIndex = -1
  let streamLength = 200
  let streamedLength = 0
  let answer = ''

  let messageChunk = ''
  let placeHolder: Message.TextMessage | undefined

  for await (const chunk of stream) {
    answer += chunk

    messageChuckIndex = Math.floor(answer.length / TELEGRAM_MAX_MESSAGE_LENGTH)

    const startIndex = messageChuckIndex * TELEGRAM_MAX_MESSAGE_LENGTH
    messageChunk = answer.substring(startIndex)

    if (messageChuckIndex > lastMessageChuckIndex) {
      if (lastMessageChuckIndex >= 0) {
        // finsih previous chunk
        const lastStartIndex =
          lastMessageChuckIndex * TELEGRAM_MAX_MESSAGE_LENGTH
        const lastEndIndex =
          (lastMessageChuckIndex + 1) * TELEGRAM_MAX_MESSAGE_LENGTH
        const lastMessageChunk = answer.substring(lastStartIndex, lastEndIndex)

        try {
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            placeHolder!.message_id,
            undefined,
            lastMessageChunk,
          )
        } catch (e) {
          console.log('failed to close a chunk')
          continue
        }

        streamedLength = 0
      }

      // start a new chunk
      try {
        placeHolder = await ctx.reply(`${messageChunk} ...`)
      } catch (e) {
        console.log('failed to start a chunk')
        continue
      }
    }

    // flush chunks
    streamedLength += chunk.length
    if (streamedLength >= streamLength) {
      try {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          placeHolder!.message_id,
          undefined,
          messageChunk,
        )
      } catch (e) {
        console.log('failed to stream a chunk')
      }
      streamedLength = 0
    }

    lastMessageChuckIndex = messageChuckIndex
  }

  // finish answer
  try {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      placeHolder!.message_id,
      undefined,
      messageChunk,
      {
        parse_mode: messageChuckIndex == 0 ? 'Markdown' : undefined,
      },
    )
  } catch (e) {
    console.log('failed to finish a answer')

    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        placeHolder!.message_id,
        undefined,
        messageChunk,
      )
    } catch (e) {
      console.log('failed to finish a answer with text format')
    }
  }

  const completionTokens = getTokenLength(answer)

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
