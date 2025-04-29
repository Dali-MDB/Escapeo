"use client";

import { useEffect, useState } from "react";
import { flightIcon, staysIcon } from "@/app/data/data";
import HistoryBox from "../components/HistoryBox";
import { flightsData, staysData } from "../data";
import { API_URL } from "@/app/utils/constants";

export default function History() {
  const [choice, setChoice] = useState("Flights");
  const [flights , setFlights] = useState([])
  const [stays , setStays] = useState([])



  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    console.log(token)
    async function fetchHistory() {

      try {
        const response = await fetch(`${API_URL}/reservation/view_my_reservations/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await response.json();
        console.log(data)
        setFlights(data.trip_reservations)
        setStays(data.hotel_reservations)

      } catch (err) {
        alert(err)
      }
    }

    fetchHistory()
  }, [])
  return (
    <div className="w-full py-0 px-2 flex flex-col gap-6">
      <div className="flex flex-row rounded-xl justify-center items-center px-5 gap-4 border-b mb-0 bg-[var(--bg-color)]">
        <div
          className={`w-[80%] flex h-full py-7 justify-start items-center gap-2 cursor-pointer ${choice === "Flights" ? "shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]" : ""
            }`}
          onClick={() => setChoice("Flights")}
        >
          {flightIcon} Flights
        </div>
        <div
          className={`flex h-full w-[80%] py-7 justify-start items-center gap-2 cursor-pointer ${choice === "Stays" ? "shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]" : ""
            }`}
          onClick={() => setChoice("Stays")}
        >
          {staysIcon} Stays
        </div>
      </div>
      


    </div>
  );
}