'use client'

import React from "react";

const CreateImageLanding: React.FC = () => {
  return (
    <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Create images
        </h2>
        <p className="mt-6 text-lg leading-8 text-gray-600">
        Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet
        fugiat veniam occaecat fugiat aliqua.
        </p>
        <div className="mt-10 flex gap-x-6 items-center justify-center">
        <a
            href="#"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
            Get started
        </a>
        <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
            Learn more <span aria-hidden="true">→</span>
        </a>
        </div>
    </div>
  );
};

export default CreateImageLanding;