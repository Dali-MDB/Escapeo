"use client";

import { useState } from "react";
import { flightIcon, staysIcon } from "@/app/data/data";
import HistoryBox from "../components/HistoryBox";
import { flightsData , staysData } from "../data";

export default function History() {
  const [choice, setChoice] = useState("Flights");

  return (
    <div className="w-full py-0 px-2 flex flex-col gap-6">
      <div className="flex flex-row rounded-xl justify-center items-center px-5 gap-4 border-b mb-0 bg-[#FEF8F5]">
        <div
          className={`w-[80%] flex h-full py-7 justify-start items-center gap-2 cursor-pointer ${
            choice === "Flights" ? "shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]" : ""
          }`}
          onClick={() => setChoice("Flights")}
        >
          {flightIcon} Flights
        </div>
        <div
          className={`flex h-full w-[80%] py-7 justify-start items-center gap-2 cursor-pointer ${
            choice === "Stays" ? "shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]" : ""
          }`}
          onClick={() => setChoice("Stays")}
        >
          {staysIcon} Stays
        </div>
      </div>

      <div className="w-full flex flex-col justify-center items-center gap-6 ">
        {choice === "Flights" ? (
        flightsData.map((el,index)=><HistoryBox key={index} {...el} />) 
        ) :(
            staysData.map((el,index)=><HistoryBox key={index} {...el} />) 
            ) }
      </div>
    </div>
  );
}