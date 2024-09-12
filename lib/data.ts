import { Filter, ObjectId } from 'mongodb'
import { TelegramUser } from '@/types/telegram'
import { CogPredictionResult } from '@/app/webhook/prediction/route'
import {
  Account,
  Chat,
  Job,
  Message,
  Order,
  StateKey,
  Stats,
  User,
} from '@/types/collections'
import { ChatSetting, ChatSettings, PaymentMethod } from '@/types/types'
import { deleteKey, isChatSetting } from './utils'
import { FREE_TOKENS } from './constants'

const DAILY_GEMS = 20
const JOB_TIMEOUT_IN_SECONDS = 60 * 2

const myDatabase = async () => {
  const clientPromise = (await import('./mongodb')).default
  const client = await clientPromise
  return client.db(process.env.DATABASE_NAME)
}

export type DbCollection =
  | 'telegram_users'
  | 'jobs'
  | 'chats'
  | 'users'
  | 'orders'
  | 'stats'
  | 'roles'
type DbFields = {}

export const getCollection = async <T extends DbFields>(
  collection: DbCollection,
) => {
  const db = await myDatabase()
  return db.collection<T>(collection)
}

export async function getChatCollection() {
  return getCollection<Chat>('chats')
}

export async function getUserCollection() {
  return getCollection<User>('users')
}

export async function getOrderCollection() {
  return getCollection<Order>('orders')
}

export async function getStatCollection() {
  return getCollection<Stats>('stats')
}

export function buildChatId(botName: string, chatId: number) {
  return `${botName}_${chatId}`
}

export async function upsertChat(
  botName: string,
  chatId: number,
  data: Partial<Chat>,
) {
  const defaultData: Partial<Chat> = {
    first_interaction: new Date(),
    used_tokens: 0,
    messages: [],
    last_interaction: new Date(),
  }

  const update = {
    $setOnInsert: defaultData,
    // $set: data,
  }

  const collection = await getChatCollection()
  const result = await collection.findOneAndUpdate(
    {
      _id: buildChatId(botName, chatId),
    } as any,
    update,
    {
      upsert: true,
      returnDocument: 'after',
    },
  )

  return result
}

export async function getChat(botName: string, chatId: number) {
  const collection = await getChatCollection()
  return await collection.findOne({
    _id: buildChatId(botName, chatId),
  } as any)
}

export async function flushAllChatHistory() {
  const collection = await getChatCollection()
  await collection.updateMany(
    {},
    {
      $set: {
        messages: [],
      },
    },
  )
}

export async function pushChatHistory(
  botName: string,
  chatId: number,
  newMessage: Message,
  maxMessageCount: number = -1,
) {
  const filter = {
    _id: buildChatId(botName, chatId),
  }
  const data = {
    last_interaction: new Date(),
  }

  const collection = await getChatCollection()
  if (maxMessageCount > 0) {
    collection.updateOne(filter as any, {
      $set: data,
      $push: {
        messages: {
          $each: [newMessage],
          $slice: -maxMessageCount,
        },
      },
    })
  } else {
    collection.updateOne(filter as any, {
      $set: data,
      $push: {
        messages: newMessage,
      },
    })
  }
}

export async function getUserData(userId: number) {
  const collection = await getUserCollection()
  return await collection.findOne({
    _id: userId,
  } as any)
}

export async function upsertUser(userId: number, data: Partial<User>) {
  const defaultData: Partial<User> = {
    first_seen: new Date(),
    used_tokens: 0,
    total_tokens: FREE_TOKENS,
    referred_count: 0,
  }

  data.last_interaction = new Date()

  const query = { _id: userId }
  const update = {
    $setOnInsert: defaultData,
    $set: data,
  }

  const collection = await getUserCollection()
  const result = await collection.findOneAndUpdate(query, update, {
    upsert: true,
    returnDocument: 'after',
  })

  return result
}

export async function incUserUsedTokens(userId: number, used_token: number) {
  const collection = await getUserCollection()
  await collection.updateOne(
    { _id: userId },
    { $inc: { used_tokens: used_token } },
  )
}

export async function insertOrder(
  userId: number,
  telegram_bot_name: string,
  paymentMethod: PaymentMethod,
  tokenAmount: number,
  totalPrice: number,
  currency: string = 'USD',
) {
  const orderData: Order = {
    user_id: userId,
    telegram_bot_name: telegram_bot_name,
    payment_method: paymentMethod,
    token_amount: tokenAmount,
    total_price: totalPrice,
    currency: currency,
    create_time: new Date(), // MongoDB will handle this as UTC
    status: 'created',
  }

  // credit referred user
  // const user = await this.getUser(userId)
  // if (user && 'referred_by' in user && user.referred_by) {
  //   const referredBy = user.referred_by
  //   order.referred_by = referredBy
  //   const commissionRate = await this.getCommissionRate(referredBy)
  //   order.commission_rate = commissionRate
  //   order.commission = commissionRate * totalPrice
  // }

  const orders = await getOrderCollection()
  const order = await orders.insertOne(orderData)

  return order.insertedId
}

export async function getOrder(orderId: string) {
  const orders = await getOrderCollection()
  return await orders.findOne({ _id: new ObjectId(orderId) })
}

export async function updateOrder(
  orderId: string,
  data: Pick<Order, 'invoice_id' | 'invoice_url' | 'expire_time' | 'status'>,
): Promise<number> {
  const filter: Filter<Order> = {
    _id: new ObjectId(orderId),
  }
  if (data.status == 'finished') {
    filter.status = 'pending'
  }
  const orders = await getOrderCollection()
  const updateResult = await orders.updateOne(filter, { $set: data })

  return updateResult.modifiedCount
}

export async function updateChat(
  botName: string,
  chatId: number,
  data: Partial<Chat>,
): Promise<number> {
  const chats = await getChatCollection()
  const updateResult = await chats.updateOne(
    {
      _id: buildChatId(botName, chatId),
    } as any,
    { $set: data },
  )
  return updateResult.modifiedCount
}

export async function topUp(
  userId: number,
  topUpTokenAmount: number,
): Promise<number> {
  try {
    const users = await getUserCollection()
    const updateResult = await users.updateOne(
      { _id: userId },
      { $inc: { total_tokens: topUpTokenAmount } },
    )

    return updateResult.modifiedCount ?? 0
  } catch (error) {
    console.error(`Error updating user ${userId} tokens:`, error)
    return 0 // Return 0 or handle error as needed
  }
}

export async function incStats(
  field: keyof Stats,
  amount: number = 1,
): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const timestamp = today.getTime()

  const defaultData: Partial<Stats> = {
    new_users: 0,
    referral_new_users: 0,
    net_sales: 0,
    new_orders: 0,
    paid_orders: 0,
    messages: 0,
  }

  if (!(field in defaultData)) {
    throw new Error(`Invalid field ${field} for stats`)
  }

  // Prevent the effected field from the default data
  delete defaultData[field as StateKey]

  const inc = { [field]: amount }

  const query = { _id: today }
  const update = {
    $setOnInsert: defaultData,
    $inc: inc,
  }

  const stats = await getStatCollection()
  await stats.updateOne(query, update, { upsert: true })
}

export const getTelegramUser = async (userId: ObjectId) => {
  const usersCollection = await getCollection<Account>('telegram_users')
  return await usersCollection.findOne({ _id: userId })
}

export const upsertTelegramUser = async (user: TelegramUser) => {
  const usersCollection = await getCollection<Account>('telegram_users')
  const today = new Date()

  // Update the user's document and check if it has been newly inserted
  const result = await usersCollection.findOneAndUpdate(
    // TODO: create index for user id
    { user_id: user.id },
    {
      $setOnInsert: {
        // Set on insert if the user document doesn't exist
        first_seen: today,
        last_gem_issued_date: today.toDateString(),
        gems: DAILY_GEMS, // Issue 10 gems to the user
      },
      $set: {
        last_active: today,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  )
  return result
}

function isJobTimeout(startTime: Date) {
  const currentTime = new Date()
  const lockDurationSeconds =
    Math.abs(currentTime.getTime() - startTime.getTime()) / 1000
  return lockDurationSeconds > JOB_TIMEOUT_IN_SECONDS
}

export async function acquireJobLock(userId: ObjectId) {
  const user = await getTelegramUser(userId)
  // Check if the job is already locked
  if (user && user.processing_job) {
    const job = await getJobById(user.processing_job)
    if (job && !isJobTimeout(job.start_time)) {
      return false
    }
  }
  // Lock acquired
  return true
}

export async function getJobById(jobId: ObjectId) {
  const jobsCollection = await getCollection<Job>('jobs')
  return jobsCollection.findOne({ _id: jobId })
}

export async function releaseJobLock(userId: ObjectId, jobId?: ObjectId) {
  if (jobId) {
    const job = await getJobById(jobId)
    if (job) {
      if (isJobTimeout(job.start_time)) {
        return await _releaseJobLock(userId)
      } else {
        return null
      }
    }
  }
  return await _releaseJobLock(userId)
}

async function _releaseJobLock(userId: ObjectId) {
  const usersCollection = await getCollection<Account>('telegram_users')
  const updatedUser = await usersCollection.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        processing_job: undefined,
      },
    },
    {
      returnDocument: 'after',
    },
  )
  return updatedUser
}

export async function createJob(job: Job) {
  const collection = await getCollection<Job>('jobs')
  const result = await collection.insertOne(job)
  const newJobId = result.insertedId

  const usersCollection = await getCollection<Account>('telegram_users')

  await usersCollection.updateOne(
    {
      _id: job.user,
    },
    {
      $set: {
        processing_job: newJobId,
      },
      $push: {
        // TODO: create boundary for jobs
        jobs: newJobId,
      },
    } as any,
  )
  return newJobId
}

// Update
export async function updateJobStatus(data: CogPredictionResult) {
  const collection = await getCollection<Job>('jobs')
  const updatedJob = await collection.findOneAndUpdate(
    { _id: new ObjectId(data.id) },
    {
      $set: {
        status: data.status,
        outputs: {
          images: data.output,
        },
      },
    },
    {
      returnDocument: 'after',
    },
  )

  return updatedJob
}

export const issueDailyGems = async (userId: ObjectId) => {
  const usersCollection = await getCollection<Account>('telegram_users')
  const today = new Date()

  const result = await usersCollection.findOneAndUpdate(
    {
      _id: userId,
      last_gem_issued_date: { $ne: today.toDateString() },
    },
    {
      $set: {
        last_gem_issued_date: today.toDateString(),
        gems: DAILY_GEMS,
      },
      // $inc: {    // Increment the gems count if the user document exists
      //     gems: DAILY_GEMS
      // }
    },
    {
      returnDocument: 'after',
    },
  )

  if (result) {
    // Gems issued or updated for the day
    console.log('Gems issued successfully')
  } else {
    // Gems have already been issued today
    console.log('Gems already issued today')
  }
  return result
}

export const consumeGems = async (
  userId: ObjectId,
  gems: number,
  clearProcessingJob = false,
) => {
  const usersCollection = await getCollection<Account>('telegram_users')
  const today = new Date()

  let extraUpdates: Record<string, any> = {}

  if (clearProcessingJob) {
    extraUpdates.processing_job = null
  }

  const result = await usersCollection.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        last_active: today,
        ...extraUpdates,
      },
      $inc: {
        // Increment the gems count if the user document exists
        gems: -gems,
      },
    },
    {
      returnDocument: 'after',
    },
  )

  return result
}
