'use server'

const querystring = require('node:querystring');
import crypto from "crypto"
import { issueDailyGems, upsertTelegramUser } from "./data";
import { TelegramUser } from "@/types/telegram";

export const _authTelegram = (initData: string) => {
    const authData = querystring.parse(initData)
    const checkHash = authData.hash;
    delete authData.hash;
  
    const dataCheckArr = Object.keys(authData)
      .map(key => `${key}=${authData[key]}`)
      .sort()
    const dataCheckString = dataCheckArr.join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_API_TOKEN || "").digest()
    const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    if (hash !== checkHash) {
      throw new Error('Data is NOT from Telegram');
    }
  
    if ((Date.now() / 1000 - authData.auth_date) > 86400) {
      throw new Error('Data is outdated');
    }

    const user: TelegramUser = JSON.parse(authData.user)
    return user
}