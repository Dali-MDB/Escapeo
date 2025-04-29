"use client"
import { useForm } from "../context/FormContext";
import Link from "next/link";

import Image from "next/image";
export default function FlightBox(props) {
  const { setTripSelected , tripSelected } = useForm()
  return (
    <div className="group relative rounded-xl w-72  h-[400px] text-white flex flex-col justify-end items-center  transition-transform duration-300 ease-out hover:-translate-y-4">
      {/* Background Image */}
      <div className="absolute h-full w-full  rounded-[50px] overflow-hidden">
        <img width={290} height={290} alt="a" src={`http://127.0.0.1:8000${props.backgroundImage || "/media/trips_images/aa/book-with-confident.png"}`}
        /></div>

      {/* Semi-transparent Overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-[50px] bg-black bg-opacity-20">
      </div>

      {/* Card Details */}
      <div className="relative z-10 flex flex-col justify-evenly gap-10 items-center p-6 w-full">
        {/* Title */}
        <div className="flex justify-center items-end w-full px-8">
          <p className="text-xl font-semibold text-center">{props.title}</p>
        </div>

        {/* Description and Price */}
        <div className="flex justify-end items-center w-full gap-2">
          <p className="w-full">{props.description.slice(0,45)}</p>
          <div className="flex flex-col items-center justify-end w-1/2">
            <span className="text-md text-white w-fit text-[#000]">{`${props.price || "500"} $`}</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <button onClick={() => {
        setTripSelected(props.id)
        localStorage.setItem("tripSelected" , props.id)
      }} className="absolute z-10 left-1/2 translate-y-[150%] -translate-x-1/2 w-1/3 font-bold rounded-full bg-[#F38B1E] text-black  py-2 px-1 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-[50%] group-hover:opacity-100">
        <Link href={props.link}>See more</Link>
      </button>

      {/* Hover Effects */}
      <div className="absolute inset-0 border-2 border-transparent rounded-[50px] transition-all duration-300 ease-out group-hover:border-[#008bf8] group-hover:shadow-[0_4px_18px_0_rgba(0,0,0,0.25)]"></div>
    </div>
  );
};