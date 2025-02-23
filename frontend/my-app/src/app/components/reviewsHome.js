"use client";

import Image from "next/image";
import React from "react";
import { useState } from "react";
import { reviews,staryellow, starblack } from "../data/data";

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
    <div className="w-full gap-4 p-8 opacity-85 rounded-3xl bg-[#A4B5C4] flex flex-col justify-center items-center shadow-[25px_20px_2px_-5px_#071739]">
      <div className="w-full">
        <h1 className="w-full text-2xl font-bold text-black">{props.title}</h1>
      </div>
      <div className="w-full text-[#112211] opacity-50">
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
        <p className="text-lg text-black">{props.Source}</p>
        <p className="text-[#112211] opacity-50">{props.workAt}</p>
      </div>
      <div className="w-full rounded-lg">
        <Image
          src={props.img}
          alt=""
          width={250}
          height={250}
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
};

export default function Reviews() {
  return (
    <section className="h-screen flex justify-center items-center w-full mx-auto">
      <div className="w-[75%] mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-5xl font-bold py-4">Reviews</h2>
            <p className="text-xl">What people says about Escapeo facilities</p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-lg py-3 px-3">
            See All
          </button>
        </div>

        {/* Scrolling Container */}
        <div className="relative w-full text-white overflow-x-auto no-scrollbar py-6 mt-9">
          <div className="flex space-x-10 w-[calc(4.5*300px)] snap-x scroll-smooth">
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