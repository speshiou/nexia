'use server'

import { ObjectId } from 'mongodb'
import { TelegramUser } from '@/types/telegram'
import { CogPredictionResult } from '@/app/webhook/prediction/route'

const DAILY_GEMS = 20
const JOB_TIMEOUT_IN_SECONDS = 60 * 2

const myDatabase = async () => {
  const clientPromise = (await import('./mongodb')).default
  const client = await clientPromise
  return client.db('image_creator')
}

type DbCollection = 'telegram_users' | 'jobs'
type DbFields = {}

const getCollection = async <T extends DbFields>(collection: DbCollection) => {
  const db = await myDatabase()
  return db.collection<T>(collection)
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
    },
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
