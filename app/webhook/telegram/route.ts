import { upsertTelegramUser } from '@/lib/data'
import TelegramApi, { InlineKeyboardMarkup } from '@/lib/telegram/api'
import { webAppUrl } from '@/lib/utils'
import { WebhookUpdate } from '@/types/telegram'

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: Request) {
  return Response.json({ status: 'OK' })
}

export async function POST(request: Request) {
  const data: WebhookUpdate = await request.json()
  await upsertTelegramUser(data.message.from)
  const telegramApi = new TelegramApi(process.env.TELEGRAM_BOT_API_TOKEN || '')
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🪄 Create',
          web_app: {
            url: webAppUrl,
          },
        },
      ],
    ],
  } satisfies InlineKeyboardMarkup
  const text = '💫 Unleash your imagination'
  await telegramApi.sendMessage(
    data.message.chat.id,
    text,
    undefined,
    replyMarkup,
  )
  return Response.json({ status: 'OK' })
}
