'use client'

import React, { ChangeEvent, useState } from 'react'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/20/solid'
import {
  ImageRefType,
  OutputType,
  useCreateImageTask,
} from './create-image-task'
import clsx from 'clsx'
import Button from './button'

interface ImageRefOption {
  label: string
  value: ImageRefType
}

interface OutputTypeOption {
  label: string
  value: OutputType
}

interface CreateImageTextInputProps {
  hideSubmitButton?: boolean
}

const CreateImageTextInput: React.FC<CreateImageTextInputProps> = ({
  hideSubmitButton = false,
}) => {
  const [prompt, setPrompt] = useState('')
  const {
    createImages,
    taskState,
    thumbnail,
    setRefImage,
    imageRefType,
    setImageRefType,
    outputType,
    setOutputType,
  } = useCreateImageTask()

  const imageRefOptions: ImageRefOption[] = [
    {
      label: 'Reference entire image',
      value: 'full',
    },
    {
      label: 'Face only',
      value: 'face',
    },
  ]

  const outputTypeOptions: OutputTypeOption[] = [
    {
      label: 'Image',
      value: 'image',
    },
    {
      label: 'Clip',
      value: 'video',
    },
  ]

  const handleClear = () => {
    setPrompt('')
    setRefImage(null)
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value)
    event.target.style.height = 'inherit'
    event.target.style.height = `${event.target.scrollHeight}px`
  }

  const handleImageInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0]
      setRefImage(file)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (prompt.trim()) {
      createImages(prompt.trim())
    }
  }

  return (
    <form id="main-form" onSubmit={handleSubmit}>
      {/* <div className="flex justify-center gap-x-10 my-4">
        {...outputTypeOptions.map((option) => {
          return <button key={option.value} type="button" className={clsx("font-semibold", {
            "dark:text-white": option.value != outputType,
            "text-indigo-600": option.value == outputType,
          })} onClick={() => setOutputType(option.value)}>{option.label}</button>
        })}
      </div> */}
      <div className="flex items-center gap-x-4">
        <div className="flex flex-1 items-center rounded-md border">
          {thumbnail && (
            <img
              className="w-12 ml-4"
              src={thumbnail as string}
              alt="Preview"
              onClick={() => setRefImage(null)}
            />
          )}
          <textarea
            value={prompt}
            onChange={handleChange}
            className="border-none bg-transparent scrollbar-none px-4 py-3 flex-1 outline-none dark:text-white max-h-32"
            placeholder={thumbnail ? 'Reimagine ...' : 'Describe the image ...'}
          ></textarea>
          {(prompt || thumbnail) && (
            <button className="p-2" onClick={handleClear}>
              <XMarkIcon className="h-5 w-5 flex-none text-gray-400" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          theme="primary"
          className={clsx({ hidden: hideSubmitButton })}
          disabled={taskState == 'processing'}
        >
          {taskState != 'processing' ? 'Create' : 'Creating'}
        </Button>
      </div>
      {!thumbnail ? (
        <p className="text-xs text-gray-500 p-2 flex items-center gap-x-2">
          <PhotoIcon className="h-5 w-5 text-gray-300" />
          <label htmlFor="imageInput" className="relative cursor-pointer">
            <span className="py-2 text-indigo-600 dark:text-indigo-500">
              Add image reference
            </span>
            <input
              id="imageInput"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageInput}
            />
          </label>
        </p>
      ) : (
        <div className="mt-6 flex space-x-6">
          {...imageRefOptions.map((option) => {
            const id = `image-ref-type-${option.value}`
            return (
              <div key={id} className="flex items-center gap-x-3">
                <input
                  id={id}
                  type="radio"
                  value={option.value}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={option.value == imageRefType}
                  onChange={() => setImageRefType(option.value)}
                />
                <label
                  htmlFor={id}
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {option.label}
                </label>
              </div>
            )
          })}
        </div>
      )}
    </form>
  )
}

export default CreateImageTextInput
