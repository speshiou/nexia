import { ObjectId } from 'mongodb'
import { Chat } from './collections'

export interface PageProps {
  lang: string
}

type UserMeta = {
  gems: number
  processing_job?: string
}

type Settings = Pick<
  Chat,
  'preferred_lang' | 'current_model' | 'current_chat_mode'
> & {
  remaining_tokens: number
}
