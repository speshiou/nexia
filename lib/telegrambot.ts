import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { getDict } from './utils'

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_TOKEN || '')
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
  await ctx.reply(`Echo: ${ctx.message.text}`)
})

export default bot
