import { upsertTelegramUser } from '@/lib/data'
import TelegramApi, { InlineKeyboardMarkup } from '@/lib/telegram/api'
import bot from '@/lib/telegrambot'
import { webAppUrl } from '@/lib/utils'
import { WebhookUpdate } from '@/types/telegram'

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: Request) {
  return Response.json({ status: 'OK' })
}

export async function POST(request: Request) {
  if (
    request.headers.get('X-Telegram-Bot-Api-Secret-Token') !=
    process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN
  ) {
    return Response.json({ status: 'INVALID' })
  }
  const update = await request.json()
  await bot.handleUpdate(update)
  return Response.json({ status: 'OK' })
}
