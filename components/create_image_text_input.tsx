'use client'

import React, { useState } from "react";
import { XMarkIcon } from '@heroicons/react/20/solid'
import { useCreateImageTask } from "./create_image_task";

const CreateImageTextInput: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const { createImages, taskState } = useCreateImageTask()

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
        <button type="submit" className="bg-blue-100 rounded-r px-3 py-2 disabled:bg-gray-300" disabled={ taskState == 'processing'}>
          Create
        </button>
      </div>
    </form>
  );
};

export default CreateImageTextInput;