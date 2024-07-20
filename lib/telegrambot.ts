import { Context, Telegraf, Telegram } from 'telegraf'
import { InlineKeyboardMarkup, Message } from 'telegraf/types'
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
import { Chat, User } from '@/types/collections'
import { CHAT_TIMEOUT, TELEGRAM_MAX_MESSAGE_LENGTH } from './constants'
import { models, ModelType } from './models'

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
    if (user.used_tokens == 0) {
      // new user
      await sendTokensMessage(ctx.telegram, user._id, user.total_tokens)
    }

    await ctx.replyWithHTML(i18n.simpleGreeting)
  })
  .command('reset', async (ctx) => {
    await updateChatState(ctx, { clearHistory: true })
  })
  .command('gpt4', async (ctx) => {
    await updateChatState(ctx, { model: 'gpt4' })
  })
  .command('gemini', async (ctx) => {
    await updateChatState(ctx, { model: 'gemini' })
  })
  .command('claude', async (ctx) => {
    await updateChatState(ctx, { model: 'claude' })
  })
  .command('chat', async (ctx) => {
    await updateChatState(ctx, { role: 'chat', clearHistory: true })
  })
  .command('proofreader', async (ctx) => {
    await updateChatState(ctx, { role: 'proofreader', clearHistory: true })
  })
  .command('dictionary', async (ctx) => {
    await updateChatState(ctx, { role: 'dictionary', clearHistory: true })
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
    await updateChatState(ctx, { clearHistory: true })
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

  let messageChuckIndex = 0
  let lastMessageChuckIndex = -1
  let streamLength = 200
  let streamedLength = 0
  let answer = ''

  let messageChunk = ''
  let placeHolder: Message.TextMessage | undefined

  await ctx.sendChatAction('typing')

  try {
    // generate
    const stream = ai.generateTextStream({
      systemPrompt: systemPrompt,
      newMessage: {
        text: newMessage,
        image: base64Image,
      },
      history: trimmedHistory,
    })

    for await (const chunk of stream) {
      answer += chunk

      messageChuckIndex = Math.floor(
        answer.length / TELEGRAM_MAX_MESSAGE_LENGTH,
      )

      const startIndex = messageChuckIndex * TELEGRAM_MAX_MESSAGE_LENGTH
      messageChunk = answer.substring(startIndex)

      if (messageChuckIndex > lastMessageChuckIndex) {
        if (lastMessageChuckIndex >= 0) {
          // finsih previous chunk
          const lastStartIndex =
            lastMessageChuckIndex * TELEGRAM_MAX_MESSAGE_LENGTH
          const lastEndIndex =
            (lastMessageChuckIndex + 1) * TELEGRAM_MAX_MESSAGE_LENGTH
          const lastMessageChunk = answer.substring(
            lastStartIndex,
            lastEndIndex,
          )

          try {
            await ctx.telegram.editMessageText(
              ctx.chat.id,
              placeHolder!.message_id,
              undefined,
              lastMessageChunk,
            )
          } catch (e) {
            console.log('failed to close a chunk')
            // continue
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
        if (messageChuckIndex == 0) {
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            placeHolder!.message_id,
            undefined,
            messageChunk,
          )
        }
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
  } catch (e) {
    await ctx.reply(
      `⚠️ Stopped unexpectedly. ${e}. Please try sending other messages`,
    )
  }
})

async function checkBalance(ctx: Context, user: User, cost: number) {
  const remainingTokens = user.total_tokens - user.used_tokens
  if (remainingTokens < cost) {
    await sendInsufficientTokensWarning(ctx, cost)
    return false
  }
  return true
}

export async function sendTokensMessage(
  telegram: Telegram,
  chatId: number,
  tokens: number,
) {
  const message = `✅ Received ${tokens.toLocaleString()} tokens`
  await telegram.sendMessage(chatId, message)
}

async function updateChatState(
  ctx: Context,
  options: { model?: ModelType; role?: string; clearHistory?: boolean },
) {
  const user = await upsertTelegramUser(ctx)
  if (!user || !ctx.chat) {
    return
  }
  const chat = await upsertChat(process.env.TELEGRAM_BOT_NAME!, ctx.chat.id, {})
  if (!chat) {
    return
  }

  const data: Partial<Chat> = {}

  if (options.model && !process.env.GENAI_MODEL) {
    data.current_model = options.model
  }

  if (options.role) {
    data.current_chat_mode = options.role
  }

  if (options.clearHistory) {
    data.history = []
  }

  // clear chat history
  const result = await updateChat(
    process.env.TELEGRAM_BOT_NAME!,
    ctx.chat.id,
    data,
  )

  if (result) {
    await sendCurretChatMode(ctx)
  }
}

async function sendCurretChatMode(ctx: Context) {
  const user = await upsertTelegramUser(ctx)
  if (!user || !ctx.chat) {
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

const sendInsufficientTokensWarning = async (
  ctx: Context,
  requiredTokens?: number,
) => {
  let replyMarkup: InlineKeyboardMarkup | undefined = undefined

  if (ctx.chat?.type == 'private') {
    replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '💎 Get more tokens',
            web_app: {
              url: `${process.env.WEB_APP_URL}/purchase?start_for_result=1`,
            },
          },
        ],
      ],
    }
  } else {
    replyMarkup = {
      inline_keyboard: [
        [
          {
            text: `👛 Check balance @${process.env.TELEGRAM_BOT_NAME}`,
            url: `https://t.me/${process.env.TELEGRAM_BOT_NAME}`,
          },
        ],
      ],
    }
  }

  let text = '⚠️ Insufficient tokens.'
  if (requiredTokens) {
    text += ` Require ${requiredTokens.toLocaleString()} tokens to process this message`
  }

  await ctx.reply(text, { reply_markup: replyMarkup })
}

export default bot
