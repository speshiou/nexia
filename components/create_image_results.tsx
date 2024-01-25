'use client'

import React, { useState } from "react";
import { useCreateImageTask } from "./create_image_task";

const CreateImageResults: React.FC = () => {
  const { imageResults, taskState } = useCreateImageTask()

  return (
    <>
      {...imageResults.map((image) => {
        const imgSrc = image.startsWith('http') ? image : `data:image/png;base64, ${image}`
        return <img className="w-1/2 p-1" key={imgSrc} src={imgSrc} />
      })}
    </>
  );
};

export default CreateImageResults;