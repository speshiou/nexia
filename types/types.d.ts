import { ObjectId } from 'mongodb'

export interface PageProps {
  lang: string
}

type UserMeta = {
  gems: number
  processing_job?: string
}
