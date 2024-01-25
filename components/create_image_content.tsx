'use client'

import React from "react";
import { TaskState, useCreateImageTask } from "./create_image_task";
import CreateImageResults from "./create_image_results";
import CreateImageProcessing from "./create_image_processing";
import CreateImageLanding from "./create_image_landing";

const CreateImageContent: React.FC = () => {
    const { taskState, setDragging } = useCreateImageTask()

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
    <div onDragOver={()=>setDragging(true)}>
    { mainContent(taskState)}
    </div>
  );
};

export default CreateImageContent;