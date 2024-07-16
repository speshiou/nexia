import bot from '@/lib/telegrambot'
import { TelegramError } from 'telegraf'

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: Request) {
  return Response.json({ status: 'OK' })
}

export async function POST(request: Request) {
  if (
    request.headers.get('X-Telegram-Bot-Api-Secret-Token') !=
    process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN
  ) {
    console.warn('Invalid secret token')
    return Response.json({ status: 'INVALID' })
  }
  const update = await request.json()
  try {
    await bot.handleUpdate(update)
  } catch (e) {
    if (e instanceof TelegramError) {
      if (e.response.error_code == 403) {
        console.log(e.response.description)
        return Response.json({ status: 'OK' })
      }
    }

    console.warn(e)
  }

  return Response.json({ status: 'OK' })
}
