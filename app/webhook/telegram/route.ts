import bot from '@/lib/telegrambot'

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
  await bot.handleUpdate(update)
  return Response.json({ status: 'OK' })
}
