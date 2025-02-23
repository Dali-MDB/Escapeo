"use client";
import { useState } from "react";
import { FaPlaneDeparture, FaHotel } from "react-icons/fa";
import { IoPaperPlane } from "react-icons/io5";
import { usePathname } from "next/navigation";
import { swapIcon,flightIcon, staysIcon, planePaper } from "../data/data";

export default function FlightSearch() {
  const [tripType, setTripType] = useState("Return");
  const [choice, setChoice] = useState("flights");

  return (
    <div className="cursor-pointer shadow-[10px_10px_35px_0_#a4b5c4] z-2 mt-[-5%] flex flex-col justify-between gap-5 items-start w-full text-lg text-black py-3 px-10 bg-gray-100 rounded-2xl">
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
          {flightIcon} Flights
        </div>
        <div
          className={`flex h-full justify-start items-center gap-2 px-0 pr-3 py-5 cursor-pointer ${
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
        {/* Fieldset for From - To */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-sm px-2">From - To</legend>
          <div className="flex p-2 gap-5 py-4 flex-row justify-between w-full">
            <div className="flex flex-row justify-evenly gap-1 items-center w-2/3">
              <input className="h-full w-1/2 rounded-sm bg-transparent text-lg outline-none" />
              <span>-</span>
              <input className="h-full w-1/2 rounded-sm bg-transparent outline-none" />
            </div>
            <div className="flex items-center justify-end w-1/3">
             {swapIcon}
            </div>
          </div>
        </fieldset>

        {/* Fieldset for Trip */}
        <fieldset className="w-1/2 border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-sm px-2">Trip</legend>
          <div className="flex p-2 gap-5 py-4 flex-row justify-between w-full">
            <input className="bg-transparent w-full outline-none" />
          </div>
        </fieldset>

        {/* Fieldset for Depart - Return */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-sm px-2">Depart - Return</legend>
          <div className="flex p-2 gap-5 py-4 flex-row justify-between w-full">
            <input className="bg-transparent w-full outline-none" />
          </div>
        </fieldset>

        {/* Fieldset for Passenger - Class */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-sm px-2">Passenger - Class</legend>
          <div className="flex p-2 gap-5 py-4 flex-row items-center justify-between w-2/3">
            <input className="h-full w-1/2 rounded-sm bg-transparent text-lg outline-none" />
            <span>-</span>
            <input className="h-full w-1/2 rounded-sm bg-transparent outline-none" />
          </div>
        </fieldset>
      </div>
      <div className="flex gap-4 h-full mb-4 w-full justify-end py-2 px-1">
        <div className="w-[30%] flex flex-row items-center justify-around gap-12 h-full">
          <div className="w-full">+ Add promo code</div>
          <button className="w-full bg-[#4B6382] rounded-md flex items-center justify-around p-2 text-white">
            {planePaper}
            <span>Show {choice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}