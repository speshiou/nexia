interface TelegramWebApp {
  initData: string
  MainButton?: MainButton,
  ready: () => void
  expand: () => void
}

interface MainButton {
  show: () => void
  hide: () => void
  enable: () => void
  disable: () => void
  showProgress: () => void
  hideProgress: () => void
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
  setParams: (params: MainButtonProps) => void 
}

type MainButtonProps = {
  text?: string;
  color?: string;
  text_color?: string;
  is_active?: boolean;
  is_visible?: boolean;
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
  MainButton,
}