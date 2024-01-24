'use client'

import React, { createContext, useState, useContext, useEffect } from "react";

// Define the shape of the context value
interface CreateImageTask {
  progress: number;
  setProgress: (progress: number) => void;
  imageResults: string[];
  taskState: "pending" | "processing" | "done";
  setTaskState: (state: "pending" | "processing" | "done") => void;
  createImages: (prompt: string) => void;
}

// Default value for the context
const defaultValue: CreateImageTask = {
  progress: 0,
  setProgress: () => { },
  imageResults: [],
  taskState: "pending",
  setTaskState: () => { },
  createImages: () => { },
};

// Create the context
export const CreateImageTaskContext = createContext<CreateImageTask>(defaultValue);

// Custom hook to access the CreateImageTaskContext from any component
export const useCreateImageTask = () => {
  return useContext(CreateImageTaskContext);
};

// CreateImageTaskProvider component to wrap the application
export function CreateImageTaskProvider({ children }: Readonly<{
  children: React.ReactNode,
}>) {
  const [progress, setProgress] = useState(0);
  const [imageResults, setImageResults] = useState<string[]>([]);
  const [taskState, setTaskState] = useState<"pending" | "processing" | "done">("pending");

  // Simulate progress increase and task state using useEffect for demo purposes
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => (prevProgress < 100 ? prevProgress + 10 : 100));
    }, 1000);

    // Simulate task processing and completion
    // setTimeout(() => {
    //   setTaskState("processing");
    //   setTimeout(() => {
    //     setTaskState("done");
    //   }, 3000);
    // }, 2000);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  // Function to upload the image
  const createImages = async (prompt: string) => {
    const HOST = "sdwebui.speshiou.com"
    // Simulate upload process
    setProgress(0);
    setTaskState("processing");

    const payload = {
      "prompt": prompt,
      "steps": 20,
      "cfg_scale": 7.5,
      "width": 512,
      "height": 768,
      // "batch_count": 2,
      "batch_size": 2,
    }

    // Add the uploaded image to the results
    try {
      const response = await fetch(`https://${HOST}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log(data)
      setImageResults([...data["images"]]);
    } catch (error) {

    } finally {
      setProgress(100);
      setTaskState("done");
    }
  };

  // Create the context value
  const value: CreateImageTask = {
    progress,
    setProgress,
    imageResults,
    taskState,
    setTaskState,
    createImages: createImages,
  };

  return <CreateImageTaskContext.Provider value={value}>{children}</CreateImageTaskContext.Provider>;
};