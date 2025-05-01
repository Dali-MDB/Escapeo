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
import FlightBox from "@/app/components/FlightBox";

const WhatToActuallyRender = ({ data }) => (
  <div className="w-full px-2  flex flex-col gap-4">
    <h1 className="text-4xl font-extrabold">Favourites</h1>
    <div className="w-full bg-[var(--bg-color)] p-8 rounded-xl h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {
        data.map((el, index) => (
          <FlightBox
            key={index}
            link={"/TripDetail"}
            backgroundImage={el?.images[0]?.image}
            title={el.title}
            description={el.description}
            price={el.departure_places[0]?.price}
            id={el.id}
          />))
      }
    </div>

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
        })
        const data = await response.json()
        setFavorites(data)
      } catch (err) {
        alert(err)
      }
    }
    fetchFav()

  }, [])
  const [choice, setChoice] = useState("Flights");

  return (

    favorites.length ? <WhatToActuallyRender data={favorites} /> : <>

      <div className="flex flex-col  min-h-[40vh] rounded-xl justify-center items-center px-5 bg-[var(--bg-color)]">

        <p className="w-fit p-4 text-lg ">
          No favorites, yet...
        </p>

        <Link href={'/Flights'} className="p-4 bg-[var(--primary)] text-[var(--bg-color)] text-xl font-medium rounded-xl">Discover Our Flights</Link>
      </div>

    </>
  )
}