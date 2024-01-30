'use client'

import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'
import "swiper/css";
import Image from "next/image";

const CreateImageLanding: React.FC = () => {
  const slides = [
    {
      img: "/images/fox.jpg",
      prompt: "Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt ametfugiat veniam occaecat fugiat aliqua."
    },
    {
      img: "/images/fox.jpg",
      img2: "/images/tiger.jpeg",
      caption: "Reference entire image"
    },
    {
      img: "/images/fox.jpg",
      prompt: "Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt ametfugiat veniam occaecat fugiat aliqua."
    },
  ]
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Create images
      </h2>
      <Swiper
        className="mt-4"
        spaceBetween={50}
        slidesPerView={1}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
      >
        {...slides.map((data) => {
          return <SwiperSlide key={data.img} className="dark:text-white">
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
            <p className="p-4">
              {data.caption}
            </p>
          </SwiperSlide>
        })}
      </Swiper>
    </div>
  );
};

export default CreateImageLanding;