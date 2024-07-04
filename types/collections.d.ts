import { Locale } from '@/lib/locales'
import { ModelType } from '@/lib/models'

type Account = {
  user_id: number
  gems: number
  processing_job?: ObjectId
  jobs: ObjectId[]
}

type JobStatus = 'start' | 'processing' | 'succeeded' | 'failed'

type Job = {
  user: ObjectId
  cost: number
  start_time: Date
  status: JobStatus
  metadata: {
    image?: {
      prompt?: string
      ref_image?: string
    }
  }
  outputs?: {
    images: string[] | null
  }
}

type Chat = {
  context: string | null
  context_src: string | null
  current_chat_mode: string
  first_interaction: Date
  last_interaction: Date
  used_tokens: number
  rate_count: number
  rate_limit_start: Date
  current_model: ModelType
  preferred_lang: Locale
}

type User = {
  _id: number
  first_name: string
  first_seen: Date
  last_interaction: Date
  last_name: string | null
  referred_by: string | null
  referred_count: number
  total_tokens: number
  used_tokens: number
  username: string | null
  last_imaging_time: Date | null
}

interface Order {
  user_id: number
  telegram_bot_name: string
  payment_method: string
  token_amount: number
  total_price: number
  currency: string
  create_time: Date
  status: 'created' | 'pending' | 'finished'
  referred_by?: string
  commission_rate?: number
  commission?: number
  invoice_id?: string
  invoice_url?: string
  expire_time?: Date
}

interface Stats {
  new_users?: number
  referral_new_users?: number
  net_sales?: number
  new_orders?: number
  paid_orders?: number
}

type StateKey = keyof Stats
