'use client'

import React, { createContext, useState, useContext, useEffect } from "react";

const HOST = "sdwebui.speshiou.com"

export type TaskState = "pending" | "processing" | "done";
export type ImageRefType = "full" | "face";
export type OutputType = "image" | "video";

// Define the shape of the context value
interface CreateImageTask {
  progress: number;
  setProgress: (progress: number) => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  imageResults: string[];
  taskState: TaskState;
  setTaskState: (state: TaskState) => void;
  outputType: OutputType;
  setOutputType: (state: OutputType) => void;
  imageRefType: ImageRefType,
  setImageRefType: (type: ImageRefType) => void;
  createImages: (prompt: string) => void;
  setRefImage: (file: File | null) => void;
  thumbnail: string | ArrayBuffer | null
}

interface AnimateDiffInputs {
  model: string;
  enable: boolean;
  video_length: number;
  fps: number;
  loop_number: number;
  closed_loop: string;
  batch_size: number;
  stride: number;
  overlap: number;
  format: string[];
  interp: string;
  interp_x: number;
  video_source: string | null;
  video_path: string | null;
  latent_power: number;
  latent_scale: number;
  last_frame: string | null;
  latent_power_last: number;
  latent_scale_last: number;
  request_id: string;
}

interface ScriptsInputs {
  controlnet?: {
    args: {
      input_image: string; // Assuming this is the base64 encoded image
      module: string;
      model: string;
      weight: number;
    }[];
  };
  AnimateDiff?: {
    args: AnimateDiffInputs[]
  }
}

interface Txt2ImgRequestData {
  prompt: string;
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;
  batch_size: number;
  alwayson_scripts?: ScriptsInputs;
}

// Default value for the context
const defaultValue: CreateImageTask = {
  progress: 0,
  setProgress: () => { },
  imageResults: [],
  taskState: "pending",
  setTaskState: () => { },
  createImages: () => { },
  setRefImage: function (file: File | null): void { },
  thumbnail: null,
  setImageRefType: function (type: ImageRefType): void { },
  imageRefType: "full",
  dragging: false,
  setDragging: function (dragging: boolean): void { },
  outputType: "image",
  setOutputType: function (state: OutputType): void { }
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
  const [dragging, setDragging] = useState(false);
  const [imageResults, setImageResults] = useState<string[]>([
    // 'https://th.bing.com/th/id/OIG.uKrClGRzYxsEzyj_uBMi?w=270&h=270&c=6&r=0&o=5&dpr=2&pid=ImgGn',
    // 'https://th.bing.com/th/id/OIG.uKrClGRzYxsEzyj_uBMi?w=270&h=270&c=6&r=0&o=5&dpr=2&pid=ImgGn',
    // 'https://th.bing.com/th/id/OIG.uKrClGRzYxsEzyj_uBMi?w=270&h=270&c=6&r=0&o=5&dpr=2&pid=ImgGn',
    // 'https://th.bing.com/th/id/OIG.uKrClGRzYxsEzyj_uBMi?w=270&h=270&c=6&r=0&o=5&dpr=2&pid=ImgGn',
  ]);
  const [outputType, setOutputType] = useState<OutputType>("image");
  const [taskState, setTaskState] = useState<TaskState>("pending");
  const [imageRefType, setImageRefType] = useState<ImageRefType>("full");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | ArrayBuffer | null>(null);

  // Simulate progress increase and task state using useEffect for demo purposes
  useEffect(() => {
    // const progressInterval = setInterval(() => {
    //   setProgress((prevProgress) => (prevProgress < 100 ? prevProgress + 10 : 100));
    // }, 1000);

    // Simulate task processing and completion
    // setTimeout(() => {
    //   setTaskState("processing");
    //   setTimeout(() => {
    //     setTaskState("done");
    //   }, 3000);
    // }, 2000);

    return () => {
      // clearInterval(progressInterval);
    };
  }, []);

  // Function to upload the image
  const createImages = async (prompt: string) => {
    const hasRefImage = selectedImage
    // Simulate upload process
    setProgress(0);
    setTaskState("processing");

    let payload: Txt2ImgRequestData = {
      "prompt": prompt,
      "steps": 20,
      "cfg_scale": 7,
      "width": 512,
      "height": 512,
      // "batch_count": 2,
      "batch_size": 1,
    }

    let module: string
    let model: string
    let weight: number
    switch (imageRefType) {
      case "full":
        module = "tile_resample"
        model = "control_v11f1e_sd15_tile [a371b31b]"
        weight = 0.6
        break
      case "face":
        module = "ip-adapter_clip_sd15"
        model = "ip-adapter-full-face_sd15 [852b9843]"
        weight = 0.6
        break
    }

    const scripts: ScriptsInputs = {}

    if (thumbnail && outputType == "image") {
      // trim data url prefix
      const encodedImage = (thumbnail as string).replace(/^data:.+?,/, "")
      scripts["controlnet"] = {
        "args": [
          {
            input_image: encodedImage,
            module: module,
            model: model,
            weight: weight,
          }
        ]
      }
    }

    if (outputType == "video") {
      scripts["AnimateDiff"] = {
        args: [
          {
            'model': 'mm_sd15_v3.safetensors',   // Motion module
            'format': ['GIF'],      // Save format, 'GIF' | 'MP4' | 'PNG' | 'WEBP' | 'WEBM' | 'TXT' | 'Frame'
            'enable': true,         // Enable AnimateDiff
            'video_length': 16,     // Number of frames
            'fps': 8,               // FPS
            'loop_number': 0,       // Display loop number
            'closed_loop': 'R+P',   // Closed loop, 'N' | 'R-P' | 'R+P' | 'A'
            'batch_size': 16,       // Context batch size
            'stride': 1,            // Stride 
            'overlap': -1,          // Overlap
            'interp': 'Off',        // Frame interpolation, 'Off' | 'FILM'
            'interp_x': 10,          // Interp X
            'video_source': null,  // Video source
            'video_path': null,       // Video path
            'latent_power': 1,      // Latent power
            'latent_scale': 32,     // Latent scale
            'last_frame': null,     // Optional last frame
            'latent_power_last': 1, // Optional latent power for last frame
            'latent_scale_last': 32,// Optional latent scale for last frame
            'request_id': ''        // Optional request id. If provided, outputs will have request id
          }
        ]
      }
    }

    payload["alwayson_scripts"] = scripts

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
      let images = data["images"]
      if (hasRefImage) {
        // SD WebUI would append the preprocess image to the end of the result
        images = images.slice(0, images.length - 1)
      }

      setImageResults([...images]);
    } catch (error) {

    } finally {
      setProgress(100);
      setTaskState("done");
    }
  };

  const setRefImage = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string
          setSelectedImage(dataUrl)
          compressImageAndSetThumbnail(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null)
      setThumbnail(null)
    }
  }

  const compressImageAndSetThumbnail = (dataURL: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setThumbnail(dataURL);
        return;
      }

      const MAX_WIDTH = 512;
      const MAX_HEIGHT = 512;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      setThumbnail(compressed);
    };
    img.src = dataURL;
  };

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
    imageRefType
  };

  return <CreateImageTaskContext.Provider value={value}>{children}</CreateImageTaskContext.Provider>;
};