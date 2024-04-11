'use client'

import React, { useState } from 'react'
import { useCreateImageTask } from './create-image-task'

const CreateImageResults: React.FC = () => {
  const { imageResults, taskState } = useCreateImageTask()

  return (
    <div className="flex flex-wrap">
      {...imageResults.map((image) => {
        return <img className="w-1/2 p-1 rounded-md" key={image} src={image} />
      })}
    </div>
  )
}

export default CreateImageResults
