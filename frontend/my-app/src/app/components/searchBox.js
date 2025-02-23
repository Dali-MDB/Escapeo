"use client";
import { useState } from "react";
import { FaPlaneDeparture, FaHotel } from "react-icons/fa";
import { IoPaperPlane } from "react-icons/io5";
import { usePathname } from "next/navigation";
import { flightIcon , staysIcon , planePaper  } from "../data/data";



export default function FlightSearch() {
  const [tripType, setTripType] = useState("Return");
  

  const [choice, setChoice] = useState("flights");

  return (
    <div className="cursor-pointer shadow-[10px_10px_35px_0_#a4b5c4] z-2 mt-[-5%] flex flex-col justify-between gap-5 items-start w-full text-lg  text-black py-3 px-10 bg-gray-100 rounded-2xl">
      {/* Tabs */}
      <div className="flex p-0 gap-4 border-b mb-4">
        <div
        className={`flex h-full justify-start items-center gap-2 px-0 pr-3 py-5 ${
          choice === "flights" ? "shadow-[inset_0_-4px_0_black]" : ""
        }`}
        
          onClick={() => {
            setChoice("flights");
          }}
        >
          {" "}
          {flightIcon} Flights
        </div>
        <div
          className={`flex h-full justify-start items-center gap-2 px-0 pr-3 py-5  cursor-pointer ${
            choice === "stays" ? "shadow-[inset_0_-4px_0_black]" : ""
          }`}
          onClick={() => {
            setChoice("stays");
          }}
        >
          {staysIcon} Stays
        </div>
      </div>
      <div className="flex flex-row justify-evenly gap-5 items-center w-full">
        <fieldset className="w-full  border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-sm px-2">From - To </legend>
          <div className="flex p-2 gap-5 py-4 flex-row justify-between w-full">
            <div className="flex flex-row jsutify-evenly gap-1 items-center w-2/3">
              <input className="h-full w-1/2 rounded-sm bg-transparent text-lg " />
              <span>-</span>
              <input className=" h-full w-1/2 rounded-sm bg-transparent  " />
            </div>
            <div className="flex items-center justify-end w-1/3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m14.782 2.22l4.495 4.494a.75.75 0 0 1 .073.976l-.072.085l-4.495 4.504a.75.75 0 0 1-1.134-.975l.072-.084l3.217-3.223H5.242A.75.75 0 0 1 4.5 7.35l-.007-.101a.75.75 0 0 1 .648-.743l.102-.007l11.698-.001l-3.218-3.217a.75.75 0 0 1-.073-.976l.073-.084a.75.75 0 0 1 .976-.073zl4.495 4.494zM19.5 16.65l.007.1a.75.75 0 0 1-.648.744l-.102.007L7.061 17.5l3.221 3.22a.75.75 0 0 1 .073.976l-.072.084a.75.75 0 0 1-.977.073l-.084-.072l-4.5-4.497a.75.75 0 0 1-.073-.976l.073-.084l4.5-4.504a.75.75 0 0 1 1.133.976l-.072.084L7.065 16h11.692a.75.75 0 0 1 .743.65l.007.1z"
                ></path>
              </svg>
            </div>
          </div>{" "}
        </fieldset>
        <fieldset className="w-1/2  border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-sm px-2">Trip </legend>
          <div className="flex p-2 gap-5 py-4 flex-row jsutify-between w-full">
            <input className="bg-transparent w-full" />
          </div>{" "}
        </fieldset>
        <fieldset className="w-full  border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-sm px-2">Depart- Return </legend>
          <div className="flex p-2 gap-5 py-4 flex-row jsutify-between w-full">
            <input className="bg-transparent w-full" />
          </div>{" "}
        </fieldset>
        <fieldset className="w-full  border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-sm px-2">Passenger - Class </legend>
          <div className="flex p-2 gap-5 py-4 flex-row items-center jsutify-between w-2/3">
            <input className="h-full focus:ring-0 focus:border-transparent w-1/2 rounded-sm bg-transparent text-lg " />
            <span>-</span>
            <input className=" h-full w-1/2 rounded-sm bg-transparent  " />
          </div>{" "}
        </fieldset>
      </div>
      <div className="flex gap-4 h-full mb-4 w-full  justify-end py-2 px-1 ">
        <div className="w-[30%] flex flex-row items-center justify-around gap-12 h-full">
          <div className="w-full">+ Add code promo</div>
          <button className="w-full bg-[#4B6382] rounded-md flex items-center justify-around p-2 text-white">
            {planePaper}
            <span> show {choice}</span>
          </button>
        </div>
      </div>
      {/*Forms
       */}
    </div>
  )
}
