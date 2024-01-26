interface TelegramWebApp {
  initData: string
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

export { TelegramWebApp }