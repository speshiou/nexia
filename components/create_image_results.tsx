'use client'

import React, { useState } from "react";
import { XMarkIcon } from '@heroicons/react/20/solid'
import { useCreateImageTask } from "./create_image_task";
import CreateImageLanding from "./create_image_landing";

const CreateImageResults: React.FC = () => {
  const { imageResults, taskState } = useCreateImageTask()

  return (
    <div className="mx-auto max-w-xl flex flex-wrap text-center">
      {taskState == 'done' ?
        <>
          {...imageResults.map((image) => {
            const imgSrc = image.startsWith('http') ? image : `data:image/png;base64, ${image}`
            return <img className="w-1/2 p-1" key={imgSrc} src={imgSrc} />
          })}
        </> :
        <CreateImageLanding />}
    </div>
  );
};

export default CreateImageResults;