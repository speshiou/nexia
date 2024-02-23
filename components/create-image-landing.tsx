'use client'

import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'
import "swiper/css";
import Image from "next/image";

const CreateImageLanding: React.FC = () => {
  const slides = [
    {
      title: "Text to Image",
      img: "/images/bunny.jpg",
      prompt: "\"A bunny mage standing on an ancient book\""
    },
    {
      title: "Create from an Image",
      img: "/images/bunny.jpg",
      img2: "/images/panda.jpg",
      caption: "\"A panda mage standing on a magic circle, fire spell, snowing\""
    },
    {
      title: "Face ID",
      img: "/images/faceid.jpg",
      img2: "/images/wonder_woman2.jpg",
      caption: "\"Wonder Woman\""
    },
  ]
  return (
    <div className="w-full">
      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        onSlideChange={() => { }}
        onSwiper={(swiper) => { }}
      >
        {...slides.map((data) => {
          return <SwiperSlide key={data.title} className="dark:text-white">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {data.title}
            </h2>
            <div className="w-full flex items-center gap-x-2">
              <div className="flex-1">
                <Image
                  src={data.img}
                  width={512}
                  height={512}
                  className="flex-1 aspect-square rounded-md"
                  alt="Demo image" />
              </div>
              {data.prompt && <p className="flex-1 p-4 text-gray-600 dark:text-gray-400">
                {data.prompt}
              </p>}
              {data.img2 && <div className="flex-1"><Image
                className="aspect-square rounded-md"
                src={data.img2}
                width={512}
                height={512}
                alt="Demo image"
              /></div>}
            </div>
            <p className="p-4 text-gray-600 dark:text-gray-400">
              {data.caption}
            </p>
          </SwiperSlide>
        })}
      </Swiper>
    </div>
  );
};

export default CreateImageLanding;