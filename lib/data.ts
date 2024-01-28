'use server'

import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import { TelegramUser } from "@/types/telegram";
import { Account } from "@/types/types";

const DAILY_GEMS = 10

enum Collection {
    TelegramUser = "telegram_users",
}

const myDatabase = async () => {
    const client = await clientPromise
    return client.db("image_creator")
}

export const getTelegramUser = async (userId: number) => {
    const db = await myDatabase()
    const usersCollection = db.collection<Account>(Collection.TelegramUser)
    const today = new Date()
    return await usersCollection.findOne(
        { _id: userId },
    )
}

export const upsertTelegramUser = async (user: TelegramUser) => {
    const db = await myDatabase()
    const usersCollection = db.collection<Account>(Collection.TelegramUser)
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

export const issueDailyGems = async (userId: number) => {
    const db = await myDatabase()
    const usersCollection = db.collection<Account>(Collection.TelegramUser)
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

export const consumeGems = async (userId: number, gems: number) => {
    const db = await myDatabase()
    const usersCollection = db.collection<Account>(Collection.TelegramUser)
    const today = new Date()

    const result = await usersCollection.findOneAndUpdate(
        { 
            _id: userId, 
        },
        {
            $set: {
                last_active: today,
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