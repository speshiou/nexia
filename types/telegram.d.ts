interface TelegramWebApp {
  initData: string
  MainButton?: MainButton
  BackButton?: BackButton
  close: () => void
  ready: () => void
  expand: () => void
  onEvent: (eventType: EventType, eventHandler: EventHandler) => void
  offEvent: (eventType: EventType, eventHandler: EventHandler) => void
}

export type EventType = 'viewportChanged'

export type EventHandler<T> = (props: T) => void

export interface ViewportChangedProps {
  isStateStable: boolean
}

export type ParseMode = 'HTML' | 'Markdown'

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

interface BackButton {
  show: () => void
  hide: () => void
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
}

type MainButtonProps = {
  text?: string
  color?: string
  text_color?: string
  is_active?: boolean
  is_visible?: boolean
}

type TelegramUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

type TelegramAuthUser = TelegramUser & {
  allows_write_to_pm: boolean
}

export interface WebhookUpdate {
  update_id: number
  message: {
    message_id: number
    from: TelegramUser
    chat: {
      id: number
      type: 'private'
    }
    date: number
    text?: string
  }
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

export { TelegramWebApp, TelegramAuthUser, TelegramUser, MainButton }
