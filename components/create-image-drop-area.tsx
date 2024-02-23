'use client'

import React, { useState, ChangeEvent, ReactNode } from 'react';
import { useCreateImageTask } from './create-image-task';
import clsx from 'clsx';

const CreateImageRefDropArea: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { setRefImage, dragging, setDragging } = useCreateImageTask()

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setRefImage(file)
    setDragging(false)
  };

  const muteEvent = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(event.type == "dragover")
  }

  return (
    <div
      className={clsx({
        "border": dragging,
        "border-blue-500": dragging,
      })}
      onDrop={handleDrop}
      onDragOver={muteEvent}
      onDragEnter={muteEvent}
      onDragLeave={muteEvent}
      onDragExit={muteEvent}
      onMouseLeave={()=>setDragging(false)}
    >
      <div>{children}</div>
    </div>
  );
};

export default CreateImageRefDropArea;