'use client'

import { inference, retrieveJobResult, txt2img } from '@/lib/actions'
import React, { createContext, useState, useContext, useEffect } from 'react'
import { useAccount } from './account-provider'

export type TaskState = 'pending' | 'processing' | 'done'
export type ImageRefType = 'full' | 'face'
export type OutputType = 'image' | 'video'

// Define the shape of the context value
interface CreateImageTask {
  progress: number
  setProgress: (progress: number) => void
  dragging: boolean
  setDragging: (dragging: boolean) => void
  imageResults: string[]
  taskState: TaskState
  setTaskState: (state: TaskState) => void
  outputType: OutputType
  setOutputType: (state: OutputType) => void
  imageRefType: ImageRefType
  setImageRefType: (type: ImageRefType) => void
  createImages: (prompt: string) => void
  setRefImage: (file: File | null) => void
  thumbnail: string | ArrayBuffer | null
}

// Default value for the context
const defaultValue: CreateImageTask = {
  progress: 0,
  setProgress: () => {},
  imageResults: [],
  taskState: 'pending',
  setTaskState: () => {},
  createImages: () => {},
  setRefImage: function (file: File | null): void {},
  thumbnail: null,
  setImageRefType: function (type: ImageRefType): void {},
  imageRefType: 'full',
  dragging: false,
  setDragging: function (dragging: boolean): void {},
  outputType: 'image',
  setOutputType: function (state: OutputType): void {},
}

// Create the context
export const CreateImageTaskContext =
  createContext<CreateImageTask>(defaultValue)

// Custom hook to access the CreateImageTaskContext from any component
export const useCreateImageTask = () => {
  return useContext(CreateImageTaskContext)
}

// CreateImageTaskProvider component to wrap the application
export function CreateImageTaskProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [imageResults, setImageResults] = useState<string[]>([
    // 'https://th.bing.com/th/id/OIG.uKrClGRzYxsEzyj_uBMi?w=270&h=270&c=6&r=0&o=5&dpr=2&pid=ImgGn',
    // 'https://th.bing.com/th/id/OIG.uKrClGRzYxsEzyj_uBMi?w=270&h=270&c=6&r=0&o=5&dpr=2&pid=ImgGn',
    // 'https://th.bing.com/th/id/OIG.uKrClGRzYxsEzyj_uBMi?w=270&h=270&c=6&r=0&o=5&dpr=2&pid=ImgGn',
    // 'https://th.bing.com/th/id/OIG.uKrClGRzYxsEzyj_uBMi?w=270&h=270&c=6&r=0&o=5&dpr=2&pid=ImgGn',
  ])
  const [outputType, setOutputType] = useState<OutputType>('image')
  const [imageRefType, setImageRefType] = useState<ImageRefType>('full')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<string | ArrayBuffer | null>(null)

  const { account, setAccount } = useAccount()
  const [taskState, setTaskState] = useState<TaskState>(
    account.processing_job ? 'processing' : 'pending',
  )
  const [jobId, setJobId] = useState<string | undefined>(account.processing_job)

  // Simulate progress increase and task state using useEffect for demo purposes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const exponentialCallback = (
      callback: () => void,
      delay: number,
      exponent: number,
      retries: number,
    ) => {
      console.log(`exponentialCallback: ${delay} ${taskState}`)
      if (taskState == 'processing') {
        timeoutId = setTimeout(() => {
          callback()
          if (retries >= 10) {
            return
          }
          exponentialCallback(
            callback,
            Math.min(delay * exponent, 1000 * 5),
            exponent,
            retries + 1,
          ) // Recursive call with increased delay
        }, delay)
      }
    }

    const callbackFunction = async () => {
      const result = await retrieveJobResult(jobId || '')
      if (result.status != 'processing') {
        setTaskState('done')
        setJobId(undefined)
        setImageResults(result.outputs || [])
        if (result.user) {
          setAccount(result.user)
        }
      }
    }

    if (jobId) {
      console.log(`jobId: ${jobId}`)
      exponentialCallback(callbackFunction, 2000, 1, 0) // Initial delay of 1000ms, exponential factor of 2
    }

    // Cleanup function to clear the timeout when component is unmounted
    return () => {
      console.log(`clearTimeout: ${timeoutId}`)
      clearTimeout(timeoutId)
    }
  }, [jobId])

  // Function to upload the image
  const createImages = async (prompt: string) => {
    if (taskState == 'processing') {
      return
    }
    const hasRefImage = selectedImage
    // Simulate upload process
    setProgress(0)
    setTaskState('processing')

    // Add the uploaded image to the results
    try {
      // trim data url prefix
      const encodedImage = (thumbnail as string)?.replace(/^data:.+?,/, '')
      if (outputType != 'video') {
        const jobId = await inference(prompt, encodedImage, imageRefType)
        if (jobId) {
          setJobId(jobId)
        }
      } else {
        const result = await txt2img(
          prompt,
          encodedImage,
          imageRefType,
          outputType == 'video',
        )
        setAccount(result.user)
        setImageResults([...result.images])
      }
    } catch (error) {
      // TODO: handle errors
      console.log(error)
    }
  }

  const setRefImage = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string
          setSelectedImage(dataUrl)
          compressImageAndSetThumbnail(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedImage(null)
      setThumbnail(null)
    }
  }

  const compressImageAndSetThumbnail = (dataURL: string) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setThumbnail(dataURL)
        return
      }

      const MAX_WIDTH = 512
      const MAX_HEIGHT = 512
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      const compressed = canvas.toDataURL('image/jpeg', 0.7)
      setThumbnail(compressed)
    }
    img.src = dataURL
  }

  // Create the context value
  const value: CreateImageTask = {
    thumbnail,
    progress,
    setProgress,
    dragging,
    setDragging,
    imageResults,
    taskState,
    setTaskState,
    outputType,
    setOutputType,
    setImageRefType,
    createImages: createImages,
    setRefImage: setRefImage,
    imageRefType,
  }

  return (
    <CreateImageTaskContext.Provider value={value}>
      {children}
    </CreateImageTaskContext.Provider>
  )
}
