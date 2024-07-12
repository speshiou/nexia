'use server'

import { randomUUID } from 'crypto'
import { auth } from './auth'
import {
  acquireJobLock,
  consumeGems,
  createJob,
  getUserData,
  upsertChat,
  getJobById,
  getTelegramUser,
  issueDailyGems,
  releaseJobLock,
  updateJobStatus,
  insertOrder,
  updateOrder,
  incStats,
  getOrder,
  topUp,
  updateChat,
  upsertUser,
  getChat,
} from './data'
import { upload } from './gcs'
import TelegramApi from './telegram/api'
import {
  base64PngPrefix,
  dateStamp,
  getDict,
  isChatSetting,
  isPaymentMethod,
  sanitizeStringOption,
} from './utils'
import { ObjectId } from 'mongodb'
import {
  ChatSetting,
  ChatSettings,
  PaymentMethod,
  Settings,
  UserMeta,
} from '@/types/types'
import { Chat, Job, JobStatus } from '@/types/collections'
import { ModelType, defaultModelId, models } from './models'
import { Locale, defaultLocaleId, locales } from './locales'
import { RoleData, defaultRoleId, roles } from './roles'
import { TokenPack, packages } from './packages'
import { InvoiceItem, PayPal } from './paypal'
import {
  Role,
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from './db/roles'
import { MAX_ROLE_LIMIT } from './constants'
import { verifyAuthData } from './telegram/auth'
import { Context, Telegraf } from 'telegraf'

type DiffusersInputs = {
  prompt: string
  negative_prompt?: string
  width: number
  height: number
  num_outputs: number
  ref_image?: string
  faceid_image?: string
}

export async function getAuthUser(initData: string) {
  const searchParams = new URLSearchParams(initData)
  const params = Object.fromEntries(searchParams)
  const telegramUser = verifyAuthData(
    process.env.TELEGRAM_BOT_API_TOKEN!,
    params,
  )
  return {
    id: telegramUser.id,
    from: process.env.TELEGRAM_BOT_NAME!,
  }
}

export async function resolveModel(model: string): Promise<ModelType> {
  if (process.env.GENAI_MODEL) {
    model = process.env.GENAI_MODEL
  }
  if (model in models) {
    return model as ModelType
  }
  return defaultModelId
}

export async function resolveRole(
  userId: number,
  roleId: string,
  details: boolean = false,
) {
  const customRoles = await getRoles(userId, details)
  const customRolesCache = customRoles.reduce<{
    [id: string]: RoleData
  }>((prev, curr) => {
    prev[curr._id.toString()] = {
      id: curr._id.toString(),
      name: curr.name,
      prompt: curr.prompt,
    }
    return prev
  }, {})
  const rolesCache: { [id: string]: RoleData } = {
    ...roles,
    ...customRolesCache,
  }

  const currentRoleId = sanitizeStringOption(
    Object.keys(rolesCache),
    roleId,
    defaultRoleId,
  ) as string

  const role = rolesCache[currentRoleId]

  const currentRole: RoleData = {
    id: currentRoleId,
    name: role.name,
    prompt: role.prompt,
  }
  return currentRole
}

export async function getSettings(initData: string) {
  const authUser = await getAuthUser(initData)
  const chat = await upsertChat(authUser.from, authUser.id, {})
  const user = await getUserData(authUser.id)

  const settings = {
    current_model: await resolveModel(chat!.current_model),
    preferred_lang: sanitizeStringOption(
      Object.keys(locales),
      chat?.preferred_lang,
      defaultLocaleId,
    ) as Locale,
    remaining_tokens: user ? user!.total_tokens - user!.used_tokens : 0,
    current_chat_mode: await resolveRole(
      authUser!.id,
      chat?.current_chat_mode || defaultRoleId,
    ),
  }

  return settings
}

export async function updateSettings(
  settings: Partial<ChatSettings>,
  initData: string,
) {
  const authUser = await getAuthUser(initData)
  // sanitize
  const keys = Object.keys(settings)
  for (const key of keys) {
    if (!isChatSetting(key)) {
      delete settings[key as ChatSetting]
    }
  }

  let notify = false
  if (settings.current_chat_mode) {
    // clear history when the chat mode changed
    ;(settings as Chat).history = []
    notify = true
  }
  if (settings.current_model) {
    notify = true
  }
  const result = await updateChat(authUser.from, authUser.id, settings)
  if (result && notify) {
    const chat = await getChat(authUser.from, authUser.id)
    if (chat) {
      const modelId = await resolveModel(chat?.current_model)
      const model = models[modelId]
      const role = await resolveRole(authUser.id, chat?.current_chat_mode)

      const i18n = await getDict('en')
      const app = new Telegraf(process.env.TELEGRAM_BOT_API_TOKEN!)
      await app.telegram.sendMessage(
        authUser.id,
        i18n.currentChatStatusPattern({
          role_name: role.name,
          mode_name: model.title,
        }),
        {
          parse_mode: 'HTML',
        },
      )
    }
  }
}

export async function upsertTelegramUser(cxt: Context) {
  const telegramUser =
    cxt.message?.from || cxt.editedMessage?.from || cxt.callbackQuery?.from
  if (!telegramUser) {
    return null
  }

  if (cxt.chat?.type == 'channel') {
    return null
  }

  const user = await upsertUser(telegramUser.id, {
    username: telegramUser.username,
    first_name: telegramUser.first_name,
    last_name: telegramUser.last_name,
  })
  return user
}

export async function getCustomRoles(
  initData: string,
  details: boolean = false,
) {
  const authUser = await getAuthUser(initData)
  const roles = await getRoles(authUser.id, details)
  return roles.map((entry) => {
    return {
      id: entry._id.toString(),
      name: entry.name,
      prompt: entry.prompt,
    } satisfies RoleData
  })
}

export async function upsertCustomRole(formData: FormData) {
  const authUser = await getAuthUser(formData.get('init_data') as string)
  const roleId = formData.get('id')

  if (roleId) {
    const result = updateRole(roleId as string, authUser.id, {
      name: formData.get('name') as string,
      prompt: formData.get('prompt') as string,
    })
    return !!result
  } else {
    const roles = await getRoles(authUser.id)
    if (roles.length >= MAX_ROLE_LIMIT) {
      return false
    }
    const data: Role = {
      user_id: authUser.id,
      name: formData.get('name') as string,
      prompt: formData.get('prompt') as string,
    }
    const newRoleId = createRole(data)
    return !!newRoleId
  }
}

export async function getCustomRole(roleId: string, initData: string) {
  const authUser = await getAuthUser(initData)
  return await getRole(roleId, authUser.id)
}

export async function deleteCustomRole(roleId: string, initData: string) {
  const authUser = await getAuthUser(initData)
  return !!(await deleteRole(roleId, authUser.id))
}

export async function placeOrder(
  packIndex: number,
  paymentMethod: PaymentMethod,
  initData: string,
) {
  console.log(paymentMethod)
  const authUser = await getAuthUser(initData)
  const pack = packages[packIndex]
  if (!isPaymentMethod(paymentMethod)) {
    return
  }
  const orderId = await insertOrder(
    authUser.id,
    authUser.from,
    paymentMethod,
    pack.tokens_amount,
    pack.payment_amount,
  )

  const invoice = await createInvoice(orderId.toString(), pack, paymentMethod)
  if (invoice) {
    let text = '📋 <b>Your invoice</b>:\n\n'
    text += `${pack.tokens_amount.toLocaleString()} tokens\n`
    text += '------------------\n'
    text += `$${pack.payment_amount.toFixed(2)}\n\n\n`

    text += '💡 <b>Tips</b>:\n'

    let tips: string[] = []
    let button_text = ''

    if (paymentMethod === 'paypal') {
      tips.push(
        'If you do not have a PayPal account, click on the button located below the login button to pay with cards directly.',
      )
      button_text = '💳 Pay with Debit or Credit Card'
    } else if (paymentMethod === 'crypto') {
      tips.push(
        'If you have any issues related to crypto payment, please contact the customer service in the payment page, or send messages to {} directly for assistance.'.replace(
          '{}',
          '@cryptomus_support',
        ),
      )
      button_text = '💎 Pay with Crypto'
    }

    tips.push('Tokens will be credited within 10 minutes of payment.')
    tips.push(
      'Please contact @{} if tokens are not received after 1 hour of payment.'.replace(
        '{}',
        'nexia_support',
      ),
    )

    text += tips.map((s) => `• ${s}`).join('\n\n')

    const reply_markup = {
      inline_keyboard: [
        [
          {
            text: button_text,
            url: invoice.url,
          },
        ],
      ],
    }

    const telegramApi = new TelegramApi(
      process.env.TELEGRAM_BOT_API_TOKEN || '',
    )
    await telegramApi.sendMessage(authUser.id, text, 'HTML', reply_markup)
    return true
  }
  return false
}

async function createInvoice(
  orderId: string,
  pack: TokenPack,
  paymentMethod: PaymentMethod,
) {
  const items: InvoiceItem[] = [
    {
      name: `${pack.tokens_amount.toLocaleString()} tokens`,
      quantity: 1,
      currency_code: 'USD',
      price: pack.payment_amount,
    },
  ]

  let invoiceId: string | null = null
  let invoiceUrl: string | null = null
  const due_interval: number = 60 * 60 * 24
  let expired_at: number = Date.now() + due_interval * 1000

  switch (paymentMethod) {
    case 'paypal':
      const paypal = new PayPal(
        process.env.PAYPAL_CLIENT_ID || '',
        process.env.PAYPAL_CLIENT_SECRET || '',
        process.env.PAYPAL_SANDBOX ? true : false,
      )
      const resultPayPalCreate = await paypal.createInvoice(orderId, items)
      invoiceId = resultPayPalCreate.id
      const resultPayPalSend = await paypal.sendInvoice(invoiceId!)
      invoiceUrl = resultPayPalSend.href
      break
    case 'crypto':
      // const data = {
      //   amount: pack.payment_amount.toString(),
      //   currency: 'USD',
      //   order_id: invoiceId,
      //   lifetime: '7200',
      //   url_return: `https://t.me/${telegram_bot_name}`,
      //   url_callback: get_current_host() + PAYMENT_WEBHOOK,
      // }
      // // Assuming you have a function or method for making HTTP requests to your crypto API
      // const paymentResult = await makeCryptoPaymentRequest(data)
      // invoiceId = paymentResult.uuid
      // invoiceUrl = paymentResult.url
      // expired_at = paymentResult.expired_at
      break
  }

  console.log({
    status: 'OK',
    url: invoiceUrl,
    expired_at: expired_at,
  })

  if (invoiceId !== null && invoiceUrl != null) {
    await updateOrder(orderId, {
      invoice_id: invoiceId,
      invoice_url: invoiceUrl,
      expire_time: new Date(expired_at),
      status: 'pending',
    })
    await incStats('new_orders')
    return {
      url: invoiceUrl,
      expired_at: expired_at,
    }
  }
}

export async function finishOrder(orderId: string) {
  const order = await getOrder(orderId)
  if (!order || order.telegram_bot_name != process.env.TELEGRAM_BOT_NAME) {
    return
  }
  if (order.status === 'finished') {
    console.error(`dup finished order ${orderId}`)
    return
  }

  const updated = await topUp(order.user_id, order.token_amount)
  if (!updated) {
    return
  }
  try {
    await updateOrder(orderId, { status: 'finished' })

    await incStats('paid_orders')
    await incStats('net_sales', order.total_price)

    // if (order.referred_by) {
    //   await creditReferralReward(order.referred_by, order.commission)
    // }

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '👛 Check balance',
            callback_data: 'balance',
          },
        ],
      ],
    }

    const message = `✅ ${order.token_amount.toLocaleString()} tokens have been credited`

    const telegramApi = new TelegramApi(
      process.env.TELEGRAM_BOT_API_TOKEN || '',
    )
    await telegramApi.sendMessage(
      order.user_id,
      message,
      undefined,
      replyMarkup,
    )
  } catch (error) {
    console.error(`Error finishing order ${orderId}:`, error)
  }
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

export async function txt2img(
  prompt: string,
  refImage?: string,
  imageRefType?: 'full' | 'face',
  video: boolean = false,
) {
  const user = await getUser()
  if (!user) {
    throw new Error('Permission Denied')
  }

  const cost = video ? 2 : 1
  if (user.gems < cost) {
    throw new Error('insufficient Gems')
  }

  let host = process.env.SD_HOST
  let payload: Txt2ImgRequestData = {
    prompt: `masterpiece, best quality, ${prompt}`,
    negative_prompt:
      'ugly, deformed, noisy, blurry, low contrast, text, BadDream, 3d, cgi, render, fake, big forehead, long neck',
    steps: 7,
    cfg_scale: 2,
    width: 1024,
    height: 1024,
    // "batch_count": 2,
    batch_size: 2,
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
      module: 'tile_resample',
      model: 'control_v11f1e_sd15_tile [a371b31b]',
      weight: 0.6,
    }
    switch (imageRefType) {
      case 'full':
        inputs.module = 'depth_midas'
        inputs.model = 't2i-adapter_diffusers_xl_depth_midas [9c183166]'
        inputs.weight = 0.6
        break
      case 'face':
        inputs.module = 'ip-adapter_clip_sd15'
        inputs.model = 'ip-adapter-full-face_sd15 [852b9843]'
        inputs.weight = 0.6
        break
    }

    scripts['controlnet'] = {
      args: [inputs],
    }
  }

  if (video) {
    scripts['AnimateDiff'] = {
      args: [
        {
          model: 'mm_sd15_v3.safetensors', // Motion module
          format: ['GIF'], // Save format, 'GIF' | 'MP4' | 'PNG' | 'WEBP' | 'WEBM' | 'TXT' | 'Frame'
          enable: true, // Enable AnimateDiff
          video_length: 16, // Number of frames
          fps: 8, // FPS
          loop_number: 0, // Display loop number
          closed_loop: 'R+P', // Closed loop, 'N' | 'R-P' | 'R+P' | 'A'
          batch_size: 16, // Context batch size
          stride: 1, // Stride
          overlap: -1, // Overlap
          interp: 'Off', // Frame interpolation, 'Off' | 'FILM'
          interp_x: 10, // Interp X
          video_source: null, // Video source
          video_path: null, // Video path
          latent_power: 1, // Latent power
          latent_scale: 32, // Latent scale
          last_frame: null, // Optional last frame
          latent_power_last: 1, // Optional latent power for last frame
          latent_scale_last: 32, // Optional latent scale for last frame
          request_id: '', // Optional request id. If provided, outputs will have request id
        },
      ],
    }
  }

  scripts.ADetailer = adetailerArg

  payload['alwayson_scripts'] = scripts

  const response = await fetch(`${host}/sdapi/v1/txt2img`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  let images = data['images'] as string[]
  // TODO: trim meta data
  if (refImage) {
    // SD WebUI would append the preprocess image to the end of the result
    images = images.slice(0, images.length - 1)
  }

  return await _response(user._id, cost, prompt, images, video)
}

export async function inference(
  prompt: string,
  refImage?: string,
  imageRefType?: 'full' | 'face',
) {
  const user = await getUser()
  if (!user) {
    throw new Error('Permission Denied')
  }

  const inputs: DiffusersInputs = {
    prompt: `masterpiece, best quality, ${prompt}`,
    negative_prompt:
      'low quality, ugly, deformed, noisy, blurry, low contrast, text, 3d, cgi, render, fake, big forehead, long neck',
    width: 1024,
    height: 1024,
    num_outputs: 2,
  }

  if (refImage) {
    const binaryData = Buffer.from(refImage, 'base64')
    const blob = new Blob([binaryData])
    const refImageUrl = await upload(`${dateStamp()}/${randomUUID()}.jpg`, blob)
    if (imageRefType == 'face') {
      inputs['faceid_image'] = refImageUrl
    } else {
      inputs['ref_image'] = refImageUrl
    }
  }

  if (!(await acquireJobLock(user._id))) {
    throw new Error('locked')
  }

  const cost = 1

  // if (user.gems - cost < 0) {
  //     throw new Error("Insufficient gems")
  // }

  const newJob: Job = {
    user: user._id,
    cost: cost,
    start_time: new Date(),
    status: 'start',
    metadata: {
      image: {
        prompt: prompt,
        ref_image: refImage,
      },
    },
  }

  const createdJobId = await createJob(newJob)

  const host = process.env.DIFFUSERS_HOST
  const payload = {
    id: createdJobId.toString(),
    input: {
      ...inputs,
    },
    webhook: `${process.env.HOST}/webhook/prediction`,
    webhook_events_filter: ['start', 'completed'],
  }

  const response = await fetch(`${host}/predictions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'respond-async',
    },
    body: JSON.stringify(payload),
  })

  return response.status == 202 ? createdJobId.toString() : null
}

export async function retrieveJobResult(jobId: string): Promise<{
  status: JobStatus
  outputs?: string[] | null
  user?: UserMeta
}> {
  const user = await getUser()
  if (!user) {
    throw new Error('Permission Denied')
  }

  const job = await getJobById(new ObjectId(jobId))
  if (!job) {
    await releaseJobLock(user._id)
    return {
      status: 'failed',
    }
  } else if (job.status != 'succeeded' && job.status != 'failed') {
    const updatedUser = await releaseJobLock(user._id, job._id)
    if (updatedUser) {
      return {
        status: 'failed',
      }
    }
  }
  return {
    status: job.status,
    outputs: job.outputs?.images,
    user: await getUserMeta(),
  }
}

export async function sendImages(
  telegramChatId: number,
  prompt: string,
  images: string[],
  video = false,
) {
  try {
    const telegramApi = new TelegramApi(
      process.env.TELEGRAM_BOT_API_TOKEN || '',
    )
    if (video) {
      await telegramApi.sendAnimation(telegramChatId, images[0], prompt)
    } else {
      await telegramApi.sendMediaGroup(telegramChatId, images, prompt)
    }
  } catch (error) {
    console.log(error)
  }
}

async function _response(
  userId: ObjectId,
  cost: number,
  prompt: string,
  images: string[],
  video: boolean = false,
) {
  const updatedUser = await consumeGems(userId, cost)
  if (updatedUser) {
    await sendImages(updatedUser.user_id, prompt, images)
  }

  images = images.map((image) => {
    if (URL.canParse(image)) {
      return image
    }
    return `${base64PngPrefix}${image}`
  })

  return {
    user: updatedUser!,
    images: images,
  }
}

interface AnimateDiffInputs {
  model: string
  enable: boolean
  video_length: number
  fps: number
  loop_number: number
  closed_loop: string
  batch_size: number
  stride: number
  overlap: number
  format: string[]
  interp: string
  interp_x: number
  video_source: string | null
  video_path: string | null
  latent_power: number
  latent_scale: number
  last_frame: string | null
  latent_power_last: number
  latent_scale_last: number
  request_id: string
}

interface ControlNetInputs {
  input_image: string // Assuming this is the base64 encoded image
  module: string
  model: string
  weight: number
}

interface ScriptsInputs {
  controlnet?: {
    args: {
      input_image: string // Assuming this is the base64 encoded image
      module: string
      model: string
      weight: number
    }[]
  }
  AnimateDiff?: {
    args: AnimateDiffInputs[]
  }
  ADetailer?: {}
}

interface Txt2ImgRequestData {
  prompt: string
  negative_prompt?: string
  steps: number
  cfg_scale: number
  width: number
  height: number
  batch_size: number
  alwayson_scripts?: ScriptsInputs
}

const adetailerArg = {
  args: [
    {
      ad_model: 'face_yolov8n.pt',
      ad_denoising_strength: 0.6,
    },
  ],
}
