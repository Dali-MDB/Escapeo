"use client";
import { useState } from "react";
import { FaPlaneDeparture, FaHotel } from "react-icons/fa";
import { IoPaperPlane } from "react-icons/io5";
import { usePathname } from "next/navigation";
import Button from "./Radio";
export default function FlightSearch() {
  const [tripType, setTripType] = useState("Return");
  const planePaper = (<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 512 512">
    <path fill="currentColor" d="M496 16L15.88 208L195 289L448 64L223 317l81 179z"></path>
  </svg>)
  
  
  const fl = (



    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 512 512"
      aria-label="Find Flights"
    >
      <path
        fill="currentColor"
        d="M407.72 208c-2.72 0-14.44.08-18.67.31l-57.77 1.52L198.06 48h-62.81l74.59 164.61l-97.31 1.44L68.25 160H16.14l20.61 94.18c.15.54.33 1.07.53 1.59a.26.26 0 0 1 0 .15a15 15 0 0 0-.53 1.58L15.86 352h51.78l45.45-55l96.77 2.17L135.24 464h63l133-161.75l57.77 1.54c4.29.23 16 .31 18.66.31c24.35 0 44.27-3.34 59.21-9.94C492.22 283 496 265.46 496 256c0-30.06-33-48-88.28-48m-71.29 87.9"
      />
    </svg>
  );
  const st = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 512 512"
      aria-label="Find Stays"
    >
      <path
        fill="currentColor"
        d="M432 230.7a79.4 79.4 0 0 0-32-6.7H112a79.5 79.5 0 0 0-32 6.69A80.09 80.09 0 0 0 32 304v112a16 16 0 0 0 32 0v-8a8.1 8.1 0 0 1 8-8h368a8.1 8.1 0 0 1 8 8v8a16 16 0 0 0 32 0V304a80.09 80.09 0 0 0-48-73.3M376 80H136a56 56 0 0 0-56 56v72a4 4 0 0 0 5.11 3.84A95.5 95.5 0 0 1 112 208h4.23a4 4 0 0 0 4-3.55A32 32 0 0 1 152 176h56a32 32 0 0 1 31.8 28.45a4 4 0 0 0 4 3.55h24.46a4 4 0 0 0 4-3.55A32 32 0 0 1 304 176h56a32 32 0 0 1 31.8 28.45a4 4 0 0 0 4 3.55h4.2a95.5 95.5 0 0 1 26.89 3.85A4 4 0 0 0 432 208v-72a56 56 0 0 0-56-56"
      />
    </svg>
  );

  const [choice, setChoice] = useState("flights");

  return (
    <div className="shadow-[10px_10px_35px_0_#a4b5c4] z-2 mt-[-5%] flex flex-col justify-between gap-5 items-start w-full text-lg  text-black py-3 px-10 bg-gray-100 rounded-2xl shadow-lg">
      {/* Tabs */}
      <div className="flex p-0 gap-4 border-b mb-4">
        <button
          className={`flex h-full justify-start items-center gap-2 px-0 pr-3 py-5 ${
            choice === "flights" ? "shadow-[inset_0_-4px_0_black]" : ""
          }`}
          onClick={() => {
            setChoice("flights");
          }}
        >
          {" "}
          {fl} Flights
        </button>
        <button
          className={`flex h-full justify-start items-center gap-2 px-0 pr-3 py-5  ${
            choice === "stays" ? "shadow-[inset_0_-4px_0_black]" : ""
          }`}
          onClick={() => {
            setChoice("stays");
          }}
        >
          {st} Stays
        </button>
      </div>
      <div className="flex flex-row justify-evenly gap-5 items-center w-full">
        
      <fieldset className="w-full  border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-sm px-2">From - To </legend>
          <div className="flex p-2 gap-5 py-4 flex-row jsutify-between w-full">
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
       <div className="flex gap-4 h-full mb-4 w-full  justify-end p-2 ">
        <div className="w-1/4 flex flex-row justify-around gap-12 h-full">
       <button className="w-1/2">+ Add code promo</button>
       <button className="w-1/2 bg-[#4B6382] rounded-md flex items-center justify-around p-2 text-white">{planePaper}<span> show {choice}</span></button>
       </div>
        </div>   
      {/*Forms
       */}
    </div>
  );
}
