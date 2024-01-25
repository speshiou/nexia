'use client'

import React, { useState } from "react";
import { XMarkIcon } from '@heroicons/react/20/solid'
import { ImageRefType, useCreateImageTask } from "./create_image_task";

interface ImageRefOption {
  label: string
  value: ImageRefType
}

const CreateImageTextInput: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const { createImages, taskState, thumbnail, setRefImage, imageRefType, setImageRefType } = useCreateImageTask()

  const imageRefOptions: ImageRefOption[] = [
    {
      label: "Reference full image",
      value: "full",
    },
    {
      label: "Face only",
      value: "face",
    },
  ]

  const handleClear = () => {
    setInputValue("");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // handle submitting the form
    console.log("Submitted with value:", inputValue);
    createImages(inputValue)
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center border">
        {thumbnail && <img className="w-12" src={thumbnail as string} alt="Preview" onClick={() => setRefImage(null)} />}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          className="border-none px-3 py-2 flex-1 outline-none"
          placeholder="Enter text"
        />
        {inputValue && <button className="p-2" onClick={handleClear}>
          <XMarkIcon className="h-5 w-5 flex-none text-gray-400" />
        </button>}
        <button type="submit" className="bg-blue-100 rounded-r px-3 py-2 disabled:bg-gray-300" disabled={taskState == 'processing'}>
          Create
        </button>
      </div>
      <div className="my-6 flex space-x-6">
        {...imageRefOptions.map((option) => {
          const id = `image-ref-type-${option.value}`
          return <div key={id} className="flex items-center gap-x-3">
          <input
            id={id}
            name="push-notifications"
            type="radio"
            value={option.value}
            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
            checked={option.value == imageRefType}
            onChange={() => setImageRefType(option.value)}
          />
          <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
            {option.label}
          </label>
        </div>
        })}
      </div>
    </form>
  );
};

export default CreateImageTextInput;