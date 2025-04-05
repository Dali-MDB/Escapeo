"use client";

import { useState } from "react";
import { BigOffers, stays, flightIcon, staysIcon } from "@/app/data/data";
import FlightCard from "@/app/components/FlightCard";
import UniqueStayCard from "@/app/UniqueStaysCard";

export default function Favourite() {
  const [choice, setChoice] = useState("Flights");

  return (
    <div className="w-full px-2  flex flex-col gap-14">
      {/* Toggle Between Flights and Stays */}
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

      {/* Display Favourite Flights or Stays */}
      {choice === "Flights" ? (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BigOffers.filter((el) => el.isFavourite).map((flight, index) => (
            <FlightCard key={index} {...flight} />
          ))}
        </div>
      ) : (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stays
            .filter((st) => st.isFavourite)
            .map((stay, index) => (
              <UniqueStayCard key={index} {...stay} />
            ))}
        </div>
      )}
    </div>
  );
}