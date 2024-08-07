import dictionaries from '@/dictionaries/resources'
import { ChatSetting, PaymentMethod } from '@/types/types'
import { Locale } from './locales'

export const escapeHtml = (unsafe: string) => {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export const webAppUrl = `${process.env.HOST}/webapp`
export const base64PngPrefix = 'data:image/png;base64,'

export function dateStamp() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Adding 1 because getMonth() returns zero-based index
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

export function sanitizeStringOption(
  options: string[],
  value?: string,
  defaultValue?: string,
) {
  if (value && options.includes(value)) {
    return value
  }
  return defaultValue
}

export function isPaymentMethod(method: string): method is PaymentMethod {
  const allowedMethods: PaymentMethod[] = ['crypto', 'paypal']
  return allowedMethods.includes(method as PaymentMethod)
}

export function isChatSetting(key: string): key is ChatSetting {
  const keys: ChatSetting[] = [
    'preferred_lang',
    'current_chat_mode',
    'current_model',
  ]
  return keys.includes(key as ChatSetting)
}

export function deleteKey<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): void {
  delete obj[key]
}

export async function getDict(locale: string) {
  if (!dictionaries.hasOwnProperty(locale)) {
    locale = 'en'
  }
  return await dictionaries[locale as Locale]()
}
