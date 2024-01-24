'use client'

import React, { useState, ChangeEvent } from 'react';
import { useCreateImageTask } from './create_image_task';

const CreateImageRefDropArea: React.FC = () => {
  const { setRefImage } = useCreateImageTask()

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setRefImage(file)
  };

  const handleImageInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setRefImage(file);
    }
  };


  return (
    <div>
      <div
        className="h-20 border-solid border"
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
      </div>
    </div>
  );
};

export default CreateImageRefDropArea;