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
import FlightSearch from "../components/searchBox";
const Hero = () => (
  <div className="w-full  h-[60vh] sm:h-[80vh] mt-24  lg:h-screen relative   mx-auto  py-5 flex flex-col  justify-start lg:justify-center items-center  ">
    <div className="bg-no-repeat h-1/3  lg:h-3/4 w-[90%] bg-[url('/coverFlights.png')] bg-center bg-cover  rounded-3xl">
      {/** */}
    </div>
    <div className="absolute bottom-[-50px] w-[80%]">
      <FlightSearch />
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
