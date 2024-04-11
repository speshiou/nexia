import { sendImages } from '@/lib/actions'
import {
  consumeGems,
  getJobById,
  getTelegramUser,
  updateJobStatus,
} from '@/lib/data'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic' // defaults to auto

export interface CogPredictionResult {
  id: string
  status: JobStatus
  output: string[] | null
  metrics:
    | {
        predict_time: number
      }
    | undefined
}

export async function POST(request: Request) {
  const result: CogPredictionResult = await request.json()
  console.log(`webhook prediction: ${result.status}`)
  const job = await getJobById(new ObjectId(result.id))
  if (job) {
    if (result.status == 'succeeded') {
      let images = result.output || []
      // images = images.map((image) => {
      //     return image.replace(new RegExp(`^${base64PngPrefix}\s*`), "")
      // })
      const telegramUser = await getTelegramUser(job.user)
      if (telegramUser) {
        await sendImages(
          telegramUser.user_id,
          job.metadata.image?.prompt || '',
          images,
        )
      }
    }
    const updatedJob = await updateJobStatus(result)
    if (updatedJob && result.status == 'succeeded') {
      await consumeGems(updatedJob.user, updatedJob.cost, true)
    }
  }
  return Response.json({ status: 'OK' })
}
