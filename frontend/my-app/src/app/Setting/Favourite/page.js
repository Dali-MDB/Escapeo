"use client";

import { useState, useEffect } from "react";
import { BigOffers, stays, flightIcon, staysIcon } from "@/app/data/data";


import FlightCard from "@/app/components/FlightCard";
import UniqueStayCard from "@/app/UniqueStaysCard";
import { API_URL } from "@/app/utils/constants";
import { Plane, Bed, Hotel } from "lucide-react";
import { fetchFavourites } from "@/app/utils/auth";
import { data } from "@/app/Dashboard/data";
import Link from "next/link";

const WhatToActuallyRender = ({ choice, setChoice }) => (
  <div className="w-full px-2  flex flex-col gap-14">
    {/* Toggle Between Flights and Stays */}
    <div className="flex flex-row rounded-xl justify-center items-center px-5 gap-4 border-b mb-0 bg-[var(--bg-color)]">
      <div
        className={`w-[80%] flex h-full py-7 justify-start items-center gap-2 cursor-pointer ${choice === "Flights" ? "shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]" : ""
          }`}
        onClick={() => setChoice("Flights")}
      >
        {Plane && <Plane size={30} />} Flights
      </div>
      <div
        className={`flex h-full w-[80%] py-7 justify-start items-center gap-2 cursor-pointer ${choice === "Stays" ? "shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]" : ""
          }`}
        onClick={() => setChoice("Stays")}
      >
        {Hotel && <Hotel size={30} />} Stays
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
export default function Favourite() {


  const [favorites, setFavorites] = useState([]);

  useEffect(() => {

    const fetchFav = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(`http://127.0.0.1:8000/favorites/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }).then(data => setFavorites(data));
      } catch (err) {
        alert(err)
      }
    }


  }, [])
  const [choice, setChoice] = useState("Flights");

  return (

    favorites.length ? <WhatToActuallyRender choice={choice} setChoice={setChoice} /> : <>

      <div className="flex flex-col  min-h-[40vh] rounded-xl justify-center items-center px-5 bg-[var(--bg-color)]">

        <p className="w-fit p-4 text-lg ">
          No favorites, yet...
        </p>

        <Link href={'/Flights'} className="p-4 bg-[var(--primary)] text-[var(--bg-color)] text-xl font-medium rounded-xl">Discover Our Flights</Link>
      </div>

    </>
  )
}