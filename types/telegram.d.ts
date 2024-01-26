interface TelegramWebApp {
  initData: string
  ready: () => void
  expand: () => void
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  allows_write_to_pm: boolean;
}


declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

export { 
  TelegramWebApp,
  TelegramUser,
}