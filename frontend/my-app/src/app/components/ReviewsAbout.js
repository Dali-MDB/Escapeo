"use client";

import React from "react";
import { useState } from "react";
import { reviews, staryellow, starblack } from "../data/data";
import Image from "next/image";


const Reviewcard = (props) => {
  const renderStars = (count) => {
    const stars = [];
    let i;
    for (i = 0; i < count; i++) {
      stars.push(<div key={i}>{staryellow}</div>);
    }
    for (let index = 0; index < 5 - count; index++) {
      stars.push(<div key={index + i}>{starblack}</div>);
    }
    return stars;
  };

  const [clicked, setClicked] = useState(false);
  return (
    <div
      className={`w-full gap-4 p-8 opacity-85 rounded-3xl bg-[#EEF6F7] flex flex-col justify-center items-center hover:border-[1px] hover:border-black transition-all duration-200 ease-in shadow-2xl hover:shadow-none`}
    >
      <div className="w-full">
        <h1 className="w-full text-2xl font-bold text-black">{props.title}</h1>
      </div>
      <div className="w-full text-[#112211] opacity-100">
        <p>
          {props.details1} {!clicked ? "..." : props.details2}
        </p>
      </div>
      <div className="w-full flex flex-col justify-center items-end">
        <button
          className="w-fit text-black"
          onClick={() => {
            setClicked(!clicked);
          }}
        >
          View {!clicked ? "more" : "less"}
        </button>
      </div>
      <div className="flex flex-row justify-start items-center w-full">
        <div className="w-1/3 flex flex-row justify-around items-center">
          {renderStars(props.starCount)}
        </div>
      </div>
      <div className="w-full flex flex-col items-start">
        <p className="text-lg font-bold text-black">{props.Source}</p>
        <p className="text-[#112211] opacity-50">{props.workAt}</p>
      </div>
      <div className="w-full rounded-lg">
        <Image
        width={1000}
        height={1000}
          src={props.img}
          alt=""
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
};

export default function Reviews(props) {
  const bg = "/bg.png"; // Ensure this path is correct and the image exists in the public folder
  
  return (
    <section
      className="h-[125vh] relative pt-10 flex justify-center items-center w-full mx-auto"
        >
      <div className="w-[80%] z-10 mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-6xl font-bold py-4">What Our Client Said About Us</h2>
            <p className="text-xl"></p>
          </div>
        </div>

        {/* Scrolling Container */}
        <div className="relative h-auto w-full text-white py-6 mt-9 mb-10">
          <div className="flex space-x-10">
            {reviews.map((review, index) => (
              <Reviewcard
                key={index}
                img={review.img}
                title={review.title}
                details1={review.details1}
                details2={review.details2}
                starCount={review.starCount}
                Source={review.Source}
                workAt={review.workAt}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}