'use client'

import Image from 'next/image'
import React from 'react'

const CreateImageProcessing: React.FC = () => {
  const index = Math.floor(Math.random() * 3) + 1
  const imgSrc = `/images/creating${index}.jpeg`
  return (
    <div className="flex flex-col items-center m-auto">
      <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Creating images ...
      </h2>
      <p className="flex-1 mb-8 text-gray-600 dark:text-gray-400">
        {
          "Feel free to close this window. The images will be sent to you when they're ready."
        }
      </p>
      <Image
        src={imgSrc}
        width={512}
        height={512}
        className="flex-1 aspect-square rounded-md max-w-60 lg:max-w-sm"
        alt="Demo image"
      />
    </div>
  )
}

export default CreateImageProcessing
