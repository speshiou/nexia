'use server'

import { ObjectId } from "mongodb";
import { TelegramUser } from "@/types/telegram";
import { Account } from "@/types/types";

const DAILY_GEMS = 10
const JOB_TIMEOUT_IN_SECONDS = 60 * 2

const myDatabase = async () => {
    const clientPromise = (await import('./mongodb')).default
    const client = await clientPromise
    return client.db("image_creator")
}

type DbCollection = "telegram_users"
type DbFields = {}

const getCollection = async <T extends DbFields>(collection: DbCollection) => {
    const db = await myDatabase()
    return db.collection<T>(collection)
}

export const getTelegramUser = async (userId: number) => {
    const usersCollection = await getCollection<Account>("telegram_users")
    const today = new Date()
    return await usersCollection.findOne(
        { _id: userId },
    )
}

export const upsertTelegramUser = async (user: TelegramUser) => {
    const usersCollection = await getCollection<Account>("telegram_users")
    const today = new Date()

    // Update the user's document and check if it has been newly inserted
    const result = await usersCollection.findOneAndUpdate(
        { _id: user.id },
        {
            $setOnInsert: {    // Set on insert if the user document doesn't exist
                first_seen: today,
                last_gem_issued_date: today.toDateString(),
                gems: DAILY_GEMS  // Issue 10 gems to the user
            },
            $set: {
                last_active: today,
            },
        },
        {
            upsert: true,
            returnDocument: "after",
        }
    );
    return result
}

export async function acquireJobLock(userId: number, jobId: string, prompt?: string, refImage?: string): Promise<boolean> {
    const user = await getTelegramUser(userId)
    // Check if the job is already locked
    if (user && user.processing_job_id && !user.last_outputs) {
        const currentTime = new Date();
        const lockDurationSeconds = Math.abs(currentTime.getTime() - user.job_start_time!.getTime()) / 1000;
        if (lockDurationSeconds < JOB_TIMEOUT_IN_SECONDS) {
            return false; // Job is already locked
        }
    }

    const usersCollection = await getCollection<Account>("telegram_users")

    // If not locked, acquire the lock
    await usersCollection.updateOne(
        {
            _id: userId,
        },
        {
            $set: {
                processing_job_id: jobId,
                processing_prompt: prompt,
                processing_ref_image: refImage,
                last_outputs: undefined,
                job_start_time: new Date(),
            }
        });
    return true; // Lock acquired
}

export async function releaseJobLock(userId: number): Promise<void> {
    // Release the job lock
    const usersCollection = await getCollection<Account>("telegram_users")
    await usersCollection.updateOne(
        {
            _id: userId,
        },
        {
            $set: {
                processing_job_id: undefined,
            }
        });
}


export const issueDailyGems = async (userId: number) => {
    const usersCollection = await getCollection<Account>("telegram_users")
    const today = new Date()

    const result = await usersCollection.findOneAndUpdate(
        {
            _id: userId,
            last_gem_issued_date: { $ne: today.toDateString() }
        },
        {
            $set: {
                last_gem_issued_date: today.toDateString()
            },
            $inc: {    // Increment the gems count if the user document exists
                gems: DAILY_GEMS
            }
        },
        {
            returnDocument: "after",
        }
    );

    if (result) {
        // Gems issued or updated for the day
        console.log("Gems issued successfully")
    } else {
        // Gems have already been issued today
        console.log("Gems already issued today")
    }
    return result
}

export const consumeGems = async (userId: number, gems: number, outputs: string[]) => {
    const usersCollection = await getCollection<Account>("telegram_users")
    const today = new Date()

    const result = await usersCollection.findOneAndUpdate(
        {
            _id: userId,
        },
        {
            $set: {
                last_active: today,
                last_outputs: outputs,
            },
            $inc: {    // Increment the gems count if the user document exists
                gems: -gems
            }
        },
        {
            returnDocument: "after",
        }
    )

    return result
}