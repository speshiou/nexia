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
