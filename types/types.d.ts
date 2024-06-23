import { ObjectId } from 'mongodb'
import { Chat } from './collections'

export interface PageProps {
  lang: string
}

type UserMeta = {
  gems: number
  processing_job?: string
}

type ChatSettings = Pick<
  Chat,
  'current_model' | 'current_chat_mode' | 'preferred_lang'
>

type ChatSetting = keyof ChatSettings

type Settings = ChatSettings & {
  remaining_tokens: number
}

type PaymentMethod = 'paypal' | 'crypto'
