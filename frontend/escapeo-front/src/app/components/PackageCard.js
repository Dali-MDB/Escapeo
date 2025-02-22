"use client";

import React from "react";
import Link from "next/link";


const PackageCard = (props) => {
  return (
    <div className="group relative rounded-[50px] w-80 h-[500px] text-white flex flex-col justify-end items-center  transition-transform duration-300 ease-out hover:-translate-y-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 rounded-[50px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${props.backgroundImage})`,
        }}
      ></div>

      {/* Semi-transparent Overlay */}
      <div className="absolute inset-0 rounded-[50px] bg-black bg-opacity-30"></div>

      {/* Card Details */}
      <div className="relative z-10 flex flex-col justify-evenly gap-10 items-center p-6 w-full">
        {/* Title */}
        <div className="flex justify-center items-end w-auto px-8">
          <p className="text-xl font-semibold text-center">{props.title}</p>
        </div>

        {/* Description and Price */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="w-full">{props.description}</p>
          <div className="flex flex-col items-end justify-center w-1/4">
            <span className="text-lg opacity-50 line-through">{`$ ${props.oldPrice}`}</span>
            <span className="text-xl text-white">{`$ ${props.newPrice}`}</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <button className="absolute z-10 left-1/2 translate-y-[150%] -translate-x-1/2 w-[60%] rounded-xl bg-[#008bf8] text-white font-medium py-2 px-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-[50%] group-hover:opacity-100">
        <Link href={props.link}>More info</Link>
      </button>

      {/* Hover Effects */}
      <div className="absolute inset-0 border-2 border-transparent rounded-[50px] transition-all duration-300 ease-out group-hover:border-[#008bf8] group-hover:shadow-[0_4px_18px_0_rgba(0,0,0,0.25)]"></div>
    </div>
  );
};

export default PackageCard;