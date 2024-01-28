'use client'

import React from "react";
import Button from "./button";

const CreateImageLanding: React.FC = () => {
  return (
    <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Create images
        </h2>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
        Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet
        fugiat veniam occaecat fugiat aliqua.
        </p>
        <div className="mt-10 flex gap-x-6 items-center justify-center">
        <Button url="#">
            Get started
        </Button>
        <Button theme="text">
            Learn more <span aria-hidden="true">→</span>
        </Button>
        <Button>Create</Button>
        </div>
    </div>
  );
};

export default CreateImageLanding;