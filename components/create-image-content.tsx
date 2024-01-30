'use client'

import React from "react";
import { TaskState, useCreateImageTask } from "./create-image-task";
import CreateImageResults from "./create-image-results";
import CreateImageProcessing from "./create-image-processing";
import CreateImageLanding from "./create-image-landing";

const CreateImageContent: React.FC = () => {
    const { taskState } = useCreateImageTask()

    const mainContent = (taskState: TaskState) => {
      switch (taskState) {
        case 'done':
          return <CreateImageResults />
        case 'processing':
          return <CreateImageProcessing />
        default:
          return <CreateImageLanding />
      }
    }
  return (
    <div className="mx-auto my-10 max-w-xl flex flex-wrap text-center">
    { mainContent(taskState)}
    </div>
  );
};

export default CreateImageContent;