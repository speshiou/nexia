export interface PageProps {
  lang: string,
}

type Account = {
  _id: number
  gems: number
  processing_job_id?: string
  processing_prompt?: string
  processing_ref_image?: string
  last_outputs?: string[]
  job_start_time?: Date
};