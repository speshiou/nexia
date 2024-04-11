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
