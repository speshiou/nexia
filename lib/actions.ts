'use server'

import { randomUUID } from "crypto"
import { auth } from "./auth"
import { acquireJobLock, consumeGems, createJob, getJobById, getTelegramUser, issueDailyGems, releaseJobLock, updateJobStatus } from "./data"
import { upload } from "./gcs"
import TelegramApi from "./telegram/api"
import { base64PngPrefix, dateStamp } from "./utils"
import { ObjectId } from "mongodb"
import { UserMeta } from "@/types/types"

type DiffusersInputs = {
    prompt: string
    negative_prompt?: string
    width: number,
    height: number,
    num_outputs: number,
    ref_image?: string
    faceid_image?: string
}

async function getUser(maybeIssueDailyGems: boolean = false) {
    const session = await auth()
    if (session && session.user && session.user.id) {
        const userId = new ObjectId(session.user.id)
        if (maybeIssueDailyGems) {
            const updatedUser = await issueDailyGems(userId)
            if (updatedUser) {
                return updatedUser
            }
        }
        
        return await getTelegramUser(userId)
    } else {
        // verify email for the standard OAuth providers
    }
    return null
}

export async function getUserMeta(maybeIssueDailyGems: boolean = false) {
    const user = await getUser(maybeIssueDailyGems)
    if (!user) {
        return {
            gems: 0,
        } satisfies UserMeta
    }
    return {
        gems: user.gems,
        processing_job: user.processing_job?.toString(),
    } satisfies UserMeta
}

export async function txt2img(prompt: string, refImage?: string, imageRefType?: "full" | "face", video: boolean = false) {
    const user = await getUser()
    if (!user) {
        throw new Error("Permission Denied")
    }

    const cost = video ? 2 : 1
    if (user.gems < cost) {
        throw new Error("insufficient Gems")
    }

    let host = process.env.SD_HOST
    let payload: Txt2ImgRequestData = {
        "prompt": `masterpiece, best quality, ${prompt}`,
        "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, text, BadDream, 3d, cgi, render, fake, big forehead, long neck",
        "steps": 7,
        "cfg_scale": 2,
        "width": 1024,
        "height": 1024,
        // "batch_count": 2,
        "batch_size": 2,
    }
    // if (refImage || video) {
    //     host = process.env.SD_CONTROL_NET_HOST
    //     payload = {
    //         "prompt": prompt,
    //         "negative_prompt": "easynegative",
    //         "steps": 20,
    //         "cfg_scale": 7,
    //         "width": 512,
    //         "height": 512,
    //         // "batch_count": 2,
    //         "batch_size": 2,
    //     }
    // }

    const scripts: ScriptsInputs = {}

    if (refImage && !video) {
        const inputs: ControlNetInputs = {
            input_image: refImage,
            module: "tile_resample",
            model: "control_v11f1e_sd15_tile [a371b31b]",
            weight: 0.6,
        }
        switch (imageRefType) {
            case "full":
                inputs.module = "depth_midas"
                inputs.model = "t2i-adapter_diffusers_xl_depth_midas [9c183166]"
                inputs.weight = 0.6
                break
            case "face":
                inputs.module = "ip-adapter_clip_sd15"
                inputs.model = "ip-adapter-full-face_sd15 [852b9843]"
                inputs.weight = 0.6
                break
        }

        scripts["controlnet"] = {
            "args": [
                inputs
            ]
        }
    }

    if (video) {
        scripts["AnimateDiff"] = {
            args: [
                {
                    'model': 'mm_sd15_v3.safetensors',   // Motion module
                    'format': ['GIF'],      // Save format, 'GIF' | 'MP4' | 'PNG' | 'WEBP' | 'WEBM' | 'TXT' | 'Frame'
                    'enable': true,         // Enable AnimateDiff
                    'video_length': 16,     // Number of frames
                    'fps': 8,               // FPS
                    'loop_number': 0,       // Display loop number
                    'closed_loop': 'R+P',   // Closed loop, 'N' | 'R-P' | 'R+P' | 'A'
                    'batch_size': 16,       // Context batch size
                    'stride': 1,            // Stride 
                    'overlap': -1,          // Overlap
                    'interp': 'Off',        // Frame interpolation, 'Off' | 'FILM'
                    'interp_x': 10,          // Interp X
                    'video_source': null,  // Video source
                    'video_path': null,       // Video path
                    'latent_power': 1,      // Latent power
                    'latent_scale': 32,     // Latent scale
                    'last_frame': null,     // Optional last frame
                    'latent_power_last': 1, // Optional latent power for last frame
                    'latent_scale_last': 32,// Optional latent scale for last frame
                    'request_id': ''        // Optional request id. If provided, outputs will have request id
                }
            ]
        }
    }

    scripts.ADetailer = adetailerArg

    payload["alwayson_scripts"] = scripts

    const response = await fetch(`${host}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    let images = data["images"] as string[]
    // TODO: trim meta data
    if (refImage) {
        // SD WebUI would append the preprocess image to the end of the result
        images = images.slice(0, images.length - 1)
    }

    return await _response(
        user._id,
        cost,
        prompt,
        images,
        video,
    )
}

export async function inference(prompt: string, refImage?: string, imageRefType?: "full" | "face") {
    const user = await getUser()
    if (!user) {
        throw new Error("Permission Denied")
    }

    const inputs: DiffusersInputs = {
        prompt: `masterpiece, best quality, ${prompt}`,
        negative_prompt: "ugly, deformed, noisy, blurry, low contrast, text, BadDream, 3d, cgi, render, fake, big forehead, long neck",
        width: 1024,
        height: 1024,
        num_outputs: 2,
    }

    if (refImage) {
        const binaryData = Buffer.from(refImage, 'base64')
        const blob = new Blob([binaryData])
        const refImageUrl = await upload(`${dateStamp()}/${randomUUID()}.jpg`, blob)
        if (imageRefType == "face") {
            inputs["faceid_image"] = refImageUrl
        } else {
            inputs["ref_image"] = refImageUrl
        }
    }

    if (!await acquireJobLock(user._id)) {
        throw new Error("locked")
    }

    const cost = 1

    if (user.gems - cost < 0) {
        throw new Error("Insufficient gems")
    }

    const newJob: Job = {
        user: user._id,
        cost: cost,
        start_time: new Date(),
        status: "start",
        metadata: {
            image: {
                prompt: prompt,
                ref_image: refImage,
            }
        },
    }

    const createdJobId = await createJob(newJob)

    const host = process.env.DIFFUSERS_HOST
    const payload = {
        "id": createdJobId.toString(),
        "input": {
            ...inputs
        },
        "webhook": `${process.env.HOST}/webhook/prediction`,
        "webhook_events_filter": ["start", "completed"],
    }

    const response = await fetch(`${host}/predictions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Prefer': 'respond-async',
        },
        body: JSON.stringify(payload)
    });

    return response.status == 202 ? createdJobId.toString() : null
}

export async function retrieveJobResult(jobId: string): Promise<{
    status: JobStatus,
    outputs?: string[] | null,
    user?: UserMeta
}> {
    const user = await getUser()
    if (!user) {
        throw new Error("Permission Denied")
    }

    const job = await getJobById(new ObjectId(jobId))
    if (!job) {
        await releaseJobLock(user._id)
        return {
            status: "failed"
        }
    } else if (job.status != "succeeded" && job.status != "failed") {
        const updatedUser = await releaseJobLock(user._id, job._id)
        if (updatedUser) {
            return {
                status: "failed"
            }
        }
    }
    return {
        status: job.status,
        outputs: job.outputs?.images,
        user: await getUserMeta(),
    }
}

export async function sendImages(telegramChatId: number, prompt: string, images: string[], video = false) {
    try {
        const telegramApi = new TelegramApi(process.env.TELEGRAM_BOT_API_TOKEN || "")
        if (video) {
            await telegramApi.sendAnimation(telegramChatId, images[0], prompt)
        } else {
            await telegramApi.sendMediaGroup(telegramChatId, images, prompt)
        }
    } catch (error) {
        console.log(error)
    }
}

async function _response(userId: ObjectId, cost: number, prompt: string, images: string[], video: boolean = false) {
    const updatedUser = await consumeGems(userId, cost)
    if (updatedUser) {
        await sendImages(updatedUser.user_id, prompt, images)
    }

    images = images.map((image) => {
        if (URL.canParse(image)) {
            return image;
        }
        return `${base64PngPrefix}${image}`
    })

    return {
        "user": updatedUser!,
        "images": images,
    }
}

interface AnimateDiffInputs {
    model: string;
    enable: boolean;
    video_length: number;
    fps: number;
    loop_number: number;
    closed_loop: string;
    batch_size: number;
    stride: number;
    overlap: number;
    format: string[];
    interp: string;
    interp_x: number;
    video_source: string | null;
    video_path: string | null;
    latent_power: number;
    latent_scale: number;
    last_frame: string | null;
    latent_power_last: number;
    latent_scale_last: number;
    request_id: string;
}

interface ControlNetInputs {
    input_image: string; // Assuming this is the base64 encoded image
    module: string;
    model: string;
    weight: number;
}

interface ScriptsInputs {
    controlnet?: {
        args: {
            input_image: string; // Assuming this is the base64 encoded image
            module: string;
            model: string;
            weight: number;
        }[];
    };
    AnimateDiff?: {
        args: AnimateDiffInputs[]
    }
    ADetailer?: {

    }
}

interface Txt2ImgRequestData {
    prompt: string;
    negative_prompt?: string
    steps: number;
    cfg_scale: number;
    width: number;
    height: number;
    batch_size: number;
    alwayson_scripts?: ScriptsInputs;
}

const adetailerArg = {
    "args": [
        {
            "ad_model": "face_yolov8n.pt",
            "ad_denoising_strength": 0.6,
        }
    ],
}