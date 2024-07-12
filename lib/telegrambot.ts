import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { getDict } from './utils'
import { incStats } from './data'
import genAI from './gen/genai'
import { upsertTelegramUser } from './actions'

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
  console.log(user)
  const answer = await genAI['gemini'].generateText({
    newMessage: {
      text: ctx.message.text,
    },
    history: [],
  })
  await ctx.reply(answer)
})

export default bot
