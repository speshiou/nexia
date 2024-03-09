import { upsertTelegramUser } from "@/lib/data"

export const dynamic = 'force-dynamic' // defaults to auto

interface CogPredictionResult {
    id: string
    status: "start" | "processing" | "completed" | "failed"
    output: string[] | null
    metrics: {
        predict_time: number
    } | undefined
}

export async function POST(request: Request) {
    const result: CogPredictionResult = await request.json()
    console.log(result);
    return Response.json({ "status": "OK" })
}