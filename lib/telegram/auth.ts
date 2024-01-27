import crypto from "crypto"
import { TelegramUser } from "@/types/telegram";

export const verifyAuthData = (botToken: string, authData: Record<string, any>) => {
    const checkHash = authData.hash;
  
    const dataCheckString = Object.keys(authData)
        .filter(key => key != "hash")
        .map(key => `${key}=${authData[key]}`)
        .sort()
        .join("\n")

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    if (hash !== checkHash) {
      throw new Error('Data is NOT from Telegram');
    }
  
    if ((Date.now() / 1000 - (parseInt(authData.auth_date))) > 86400) {
      throw new Error('Data is outdated');
    }

    const user: TelegramUser = JSON.parse(authData.user as string)
    return user
}