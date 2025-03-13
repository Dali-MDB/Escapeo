"use client";

import NavBar from "../components/NavBar";
import { useState } from "react";
import {filters,
  departicon,
  arrivalIcon,
  calendarIcon,
  searchIcon,
  filtersIcon,
  BigOffers
} from "../data/data";
import FlightCard from "../components/FlightCard";

const FlightsSearch = () => {
  const [choice, setChoice] = useState("Round Trip");

  return (
    <div className="cursor-pointer text-center shadow-[10px_10px_35px_0_#a4b5c4] z-2 mt-[-5%] flex flex-col justify-between gap-5 items-start w-full text-lg text-black py-3 px-10 pb-10 bg-gray-100 rounded-2xl">
      {/* Tabs */}
      <div className="flex p-0 gap-4 border-b mb-2">
        <div
          className={`flex h-full justify-center items-center gap-2 px-2  py-5 ${
            choice === "Round Trip" ? "shadow-[inset_0_-4px_0_black]" : ""
          }`}
          onClick={() => {
            setChoice("Round Trip");
          }}
        >
          Round Trip
        </div>
        <div
          className={`flex h-full justify-center items-center gap-2 px-0  py-5 cursor-pointer ${
            choice === "One-way trip" ? "shadow-[inset_0_-4px_0_black]" : ""
          }`}
          onClick={() => {
            setChoice("One-way trip");
          }}
        >
          One-way trip
        </div>
      </div>
      <div className="flex flex-row justify-evenly gap-5 items-center w-full">
        {/* Fieldset for From - To */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-md text-left px-2 flex justify-between items-center gap-2">
            From
          </legend>
          <div className="flex gap-5 py-3 flex-row  items-center justify-between w-full">
            <input className="h-full w-full rounded-sm bg-transparent text-lg outline-none" />{" "}
            {departicon}
          </div>
        </fieldset>
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-md text-left px-2 flex justify-between items-center gap-2">
            To
          </legend>
          <div className="flex  gap-5 py-3 flex-row items-center justify-between w-full">
            <input className="h-full w-full rounded-sm bg-transparent text-lg outline-none" />{" "}
            {arrivalIcon}
          </div>
        </fieldset>

        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-md text-left px-2 flex justify-between items-center gap-2">
            Depart
          </legend>
          <div className="flex  gap-5 py-3 flex-row items-center justify-between w-full">
            <input className="h-full w-full rounded-sm bg-transparent text-lg outline-none" />{" "}
            {calendarIcon}
          </div>
        </fieldset>{

          !(choice === "One-way trip") &&
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-md text-left px-2 flex justify-between items-center gap-2">
            Return
          </legend>
          <div className="flex  gap-5 py-3 flex-row items-center justify-between w-full">
            <input className="h-full w-full rounded-sm bg-transparent text-lg outline-none" />{" "}
            {calendarIcon}
          </div>
        </fieldset>}

        {/* Fieldset for Passenger - Class */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-md px-2 text-left ">Passenger - Class</legend>
          <div className="flex p-2 gap-5 py-3 flex-row items-center justify-between w-2/3">
            <input className="h-full w-1/2 py-1 rounded-sm bg-transparent text-lg outline-none" />
            <span>-</span>
            <input className="h-full w-1/2 rounded-sm bg-transparent outline-none" />
          </div>
        </fieldset>
        <div className="w-[28%] flex flex-row items-center justify-center mt-4 gap-5 h-full">
          <div className="w-full bg-[#F38B1E] h-full p-3 rounded-lg">
            {searchIcon}
          </div>
          <button className="w-full p-2 rounded-md flex items-center justify-center text-black">
            {filtersIcon}
          </button>
        </div>
      </div>
    </div>
  );
};

const Hero = () => (
  <div className="w-full  h-[60vh] sm:h-[80vh] mt-24  lg:h-screen relative   mx-auto  py-5 flex flex-col  justify-start lg:justify-center items-center  ">
    <div className="bg-no-repeat h-1/3  lg:h-3/4 w-[90%] bg-[url('/coverFlights.png')] bg-center bg-cover  rounded-3xl">
      {/** */}
    </div>
    <div className="absolute bottom-[-50px] w-[80%]">
      <FlightsSearch />
    </div>
  </div>
);

const FilterSection = () =>  {
  
    return (
      <div className="w-full mt-36 mx-auto flex flex-col items-center gap-4">
        {/* First row - 8 buttons */}
        <div className="flex w-[80%] mx-auto justify-center gap-2 flex-row ">
          {filters.slice(0, 8).map((filter, index) => (
            <button key={index} className={`px-4 w-full py-2 bg-white rounded-full border-4 shadow-[2px_-3px_10px_rgba(0,0,0,0.4)] ${filter.borderColor}`}>
              {filter.label}
            </button>
          ))}
        </div>
  
        {/* Second row - 9 buttons */}
        <div className="flex justify-center mx-auto gap-2 flex-row w-[90%]">
          {filters.slice(8, 17).map((filter, index) => (
                  <button key={index} className={`px-4 w-full py-2 bg-white rounded-full border-4 shadow-[2px_-3px_10px_rgba(0,0,0,0.4)]
 ${filter.borderColor}`}>
                  {filter.label}
                </button>
              ))}
        </div>
  
        {/* Third row - 8 buttons */}
        <div className="flex w-[80%] mx-auto justify-center gap-2 flex-row ">
          {filters.slice(17,25).map((filter, index) => (
            <button key={index} className={`px-4 w-full py-2 bg-white rounded-full border-4 shadow-[2px_-3px_10px_rgba(0,0,0,0.4)]
 ${filter.borderColor}`}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
  
const FlightsSection = ()=>(
<div className="w-[90%] mx-auto py-10 mt-20 gap-10 grid grid-cols-6 justify-center align-middle place-items-center">
  {BigOffers.map((BigOffer , index)=>(<FlightCard key={index} {...BigOffer} />))}


</div>)

const Flights = () => (
  <div className="bg-[#EEDAC4] py-5">
    <NavBar />
    <Hero />
    <FilterSection />
    <FlightsSection />
    <div className="w-[90%] mx-auto py-10 tetx-center flex justify-center items-center"><button className="text-center py-4 w-2/3  text-xl text-white bg-[#235784] rounded-xl ">Show More</button>
    </div>
     </div>
);

export default Flights;
