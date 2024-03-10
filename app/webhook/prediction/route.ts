import { sendImages } from "@/lib/actions"
import { getJobById, getTelegramUser, updateJobStatus } from "@/lib/data"
import { JobStatus } from "@/types/types"
import { ObjectId } from "mongodb"

export const dynamic = 'force-dynamic' // defaults to auto

export interface CogPredictionResult {
    id: string
    status: JobStatus
    output: string[] | null
    metrics: {
        predict_time: number
    } | undefined
}

export async function POST(request: Request) {
    const result: CogPredictionResult = await request.json()
    console.log(result);
    const job = await getJobById(new ObjectId(result.id))
    if (job) {
        await updateJobStatus(result)
        
        if (result.status == "succeeded") {
            let images = result.output || []
            // images = images.map((image) => {
            //     return image.replace(new RegExp(`^${base64PngPrefix}\s*`), "")
            // })
            const telegramUser = await getTelegramUser(job.user) 
            if (telegramUser) {
                await sendImages(telegramUser.user_id, job.metadata.image?.prompt || "", images)
            }
        }
    }    
    return Response.json({ "status": "OK" })
}