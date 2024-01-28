'use server'

import { getServerSession } from "next-auth"
import { _authTelegram } from "./auth"
import { consumeGems, getTelegramUser, issueDailyGems } from "./data"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import TelegramApi from "./telegram/api"

async function getLoggedInUser() {
    const session = await getServerSession(authOptions)
    if (session && session.user) {
        const telegramUserId = parseInt(session.user.id)
        return getTelegramUser(telegramUserId)
    }
    return null
}

export async function getUser() {
    const session = await getServerSession(authOptions)
    if (session && session.user) {
        const telegramUserId = parseInt(session.user.id)
        const updatedUser = await issueDailyGems(telegramUserId)
        if (updatedUser) {
            return updatedUser
        }
        return await getTelegramUser(telegramUserId)
    }
    return null
}

export async function txt2img(prompt: string, refImage?: string, imageRefType?: "full" | "face", video: boolean = false) {
    const user = await getLoggedInUser()
    if (user == null) {
        throw new Error("Permission Denied")
    }

    const cost = 1
    if (user.gems < cost) {
        throw new Error("insufficient Gems")
    }

    const HOST = "sdwebui.speshiou.com"

    let payload: Txt2ImgRequestData = {
        "prompt": prompt,
        "steps": 20,
        "cfg_scale": 7,
        "width": 512,
        "height": 512,
        // "batch_count": 2,
        "batch_size": 2,
    }

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
                inputs.module = "tile_resample"
                inputs.model = "control_v11f1e_sd15_tile [a371b31b]"
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

    payload["alwayson_scripts"] = scripts

    const response = await fetch(`https://${HOST}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    let images = data["images"]
    // TODO: trim meta data
    if (refImage) {
        // SD WebUI would append the preprocess image to the end of the result
        images = images.slice(0, images.length - 1)
    }

    const updatedUser = await consumeGems(user._id, cost)

    try {
        const telegramApi = new TelegramApi(process.env.TELEGRAM_BOT_API_TOKEN || "")
        await telegramApi.sendMediaGroup(user._id, images, prompt)
    } catch (error) {
        console.log(error)
    }

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
}

interface Txt2ImgRequestData {
    prompt: string;
    steps: number;
    cfg_scale: number;
    width: number;
    height: number;
    batch_size: number;
    alwayson_scripts?: ScriptsInputs;
}