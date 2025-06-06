"use client";

import React, { useState } from "react";
import { reviews, staryellow, starblack } from "../data/data";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

const Reviewcard = (props) => {
  const { isAuthenticated } = useAuth();

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
      className={`w-full gap-4 p-8 opacity-85 rounded-3xl ${!isAuthenticated ? "bg-transparent" : "bg-white"} flex flex-col justify-center items-center hover:border-[1px] hover:border-black transition-all duration-200 ease-in shadow-2xl hover:shadow-none ` } style={{
        boxSizing:'border-box'
      }}
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
          onClick={() => setClicked(!clicked)}
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
          width={500}
          height={500}
          src={props.img}
          alt=""
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
};

export default function Reviews(props) {
  const { isAuthenticated } = useAuth();

  const bg = "/bg.png";

  return (
    <section
      className="mt-auto h-fit sm:h-[125vh] relative pt-10 flex justify-center items-center w-full mx-auto"
      style={
        !isAuthenticated
          ? {
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : { padding: 0 }
      }
    >
      <div className="w-[80%] z-10 mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold py-4">Reviews</h2>
            <p className="text-lg sm:text-xl">What people says about Escapeo facilities</p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-lg py-3 px-3 hover:bg-black hover:text-white transition-colors duration-300">
            See All
          </button>
        </div>

        {/* Scrolling Container */}
        <div className="relative h-auto w-full text-white py-6 mt-9 mb-10">
          <div className="flex space-x-10">
            {reviews.map((review, index) => (
              <div
                key={index}
                className={`w-full ${index === 0 ? "flex" : "hidden"}  md:flex`}
              >
                <Reviewcard
                  img={review.img}
                  title={review.title}
                  details1={review.details1}
                  details2={review.details2}
                  starCount={review.starCount}
                  Source={review.Source}
                  workAt={review.workAt}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
