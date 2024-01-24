'use client'

import React, { createContext, useState, useContext, useEffect } from "react";

// Define the shape of the context value
interface ImageUploadProgress {
  progress: number;
  setProgress: (progress: number) => void;
  imageResults: string[];
  setImageResults: (results: string[]) => void;
  taskState: "pending" | "processing" | "done";
  setTaskState: (state: "pending" | "processing" | "done") => void;
  createImages: (prompt: string) => void;
}

// Default value for the context
const defaultValue: ImageUploadProgress = {
  progress: 0,
  setProgress: () => {},
  imageResults: [],
  setImageResults: () => {},
  taskState: "pending",
  setTaskState: () => {},
  createImages: () => {},
};

// Create the context
export const CreateImageTaskContext = createContext<ImageUploadProgress>(defaultValue);

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
    setTimeout(() => {
      setTaskState("processing");
      setTimeout(() => {
        setTaskState("done");
      }, 3000);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  // Function to upload the image
  const createImages = (prompt: string) => {
    // Simulate upload process
    setProgress(0);
    setTaskState("processing");
    setTimeout(() => {
      // Simulate upload completion
      setProgress(100);
      setTaskState("done");
      // Add the uploaded image to the results
      setImageResults([...imageResults]);
    }, 2000);
  };

  // Create the context value
  const value: ImageUploadProgress = {
    progress,
    setProgress,
    imageResults,
    setImageResults,
    taskState,
    setTaskState,
    createImages: createImages,
  };

  return <CreateImageTaskContext.Provider value={value}>{children}</CreateImageTaskContext.Provider>;
};