import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_TOKEN || '')
bot.on(message('text'), async (ctx) => {
  await ctx.reply(`Echo: ${ctx.message.text}`)
})

export default bot
