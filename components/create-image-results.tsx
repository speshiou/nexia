'use client'

import React, { useState } from "react";
import { useCreateImageTask } from "./create-image-task";

const CreateImageResults: React.FC = () => {
  const { imageResults, taskState } = useCreateImageTask()

  return (
    <>
      {...imageResults.map((image) => {
        return <img className="w-1/2 p-1 rounded-md" key={image} src={image} />
      })}
    </>
  );
};

export default CreateImageResults;