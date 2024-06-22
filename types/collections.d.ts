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
  current_model: string
}
