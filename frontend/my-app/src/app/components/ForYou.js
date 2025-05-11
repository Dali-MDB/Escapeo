'use client'

import Link from "next/link";
import { planePaper } from "../data/data";
import { API_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import FlightBox from "./FlightBox";


export default function foryou() {
  const [recomendations, steRecomendations] = useState([])
  const fetchRecomendation = async () => {

    const token = localStorage.getItem("accessToken");
    console.log(token)
    try {
      const response = await fetch(`${API_URL}/recommended_trips/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (
        !response.ok
      ) {
        throw new Error(response.status)
      }
      const data = await response.json()
      console.log(data)
      steRecomendations(data.recommendations)

    } catch (err) {
      if (err === 403) {
        steRecomendations([])


      }
    }


  }


  useEffect(() => {

    fetchRecomendation()
  }, [])

  const flightsImage = '/flightsImage.jpg'
  const hotelsImage = '/hotelsImage.jpg'
  const bg = '/bg.png'
  return recomendations.length ? (
    <section className="mt-auto  h-[200vh] sm:h-screen flex justify-center  items-center w-full mx-auto"

      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover", // Ensures the image covers the entire section
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
      }}>
      <div className="w-[80%] flex  flex-col gap-8  mx-auto">
        <div className="text-black flex  w-full justify-between items-start">

          <div className="w-full">
            <h1 className="w-full text-4xl sm:text-5xl font-bold text-black"> For You</h1>
            <div className="w-1/2 mt-4 text-[#112211] opacity-100">
              <p>
                Specially curated trips and exclusive deals tailored to your
                preferences. Explore, relax, and enjoy travel made just for you
              </p>
            </div>
          </div>
          <div className="w-1/2 flex flex-row justify-end items-end">
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-lg py-3 px-3">
            See All
          </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row flex gap-4">
          {
            recomendations.map((item, index) => (<FlightBox
              key={index}
              link={"/TripDetail"}
              backgroundImage={item?.images[0]?.image}
              title={item.title}
              description={item.description}
              price={item.departure_places[0]?.price}
              id={item.id}
            />))
          }

        </div>

      </div>
    </section>)
    : (
      <section className=" min-h-screen flex justify-center mt-6 py-14 items-center w-full mx-auto"  style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover", // Ensures the image covers the entire section
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
      }}>
        <div className="w-[80%] py-48 sm:py-24 mx-auto">
          <div className="text-black flex w-full justify-between items-center">
            <div className="w-1/2">
              <h2 className="text-4xl sm:text-5xl font-bold py-4">For You</h2>
              <p className="text-lg sm:text-xl">
                Specially curated trips and exclusive deals tailored to your
                preferences. Explore, relax, and enjoy travel made just for you
              </p>
            </div>
          </div>

          {/* Scrolling Container */}
          <div className="relative w-full flex flex-col sm:flex-row justify-between items-center py-6 mt-9 gap-10">
            <div
              className="relative h-[60vh] w-full rounded-2xl shadow-lg flex items-end justify-center p-4 text-white"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.01)), url(${flightsImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Text Overlay */}
              <div className="w-1/2 text-center flex flex-col justify-between gap-5 items-center px-2  pb-4">
                <p className="text-4xl w-full font-semibold">Flights</p>
                <p className="text-sm text-gray-300">
                  Find the best deals on flights to your dream destinations. Fast, easy, and affordable
                </p>
                <button className="w-1/2 bg-[#F38B1E] rounded-md flex items-center justify-center p-2 text-white">
                  {planePaper}
                  <span> show Flights</span>
                </button>
              </div>
            </div>
            <div
              className="relative h-[60vh] w-full rounded-2xl shadow-lg flex items-end justify-center p-4 text-white "
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.01)), url(${hotelsImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Text Overlay */}
              <div className="w-1/2 text-center flex flex-col justify-between gap-5 items-center px-2  pb-4">
                <p className="text-4xl w-full font-semibold">Hotels</p>
                <p className="text-sm text-gray-300">Stay in comfort with top-rated hotels at the best prices. Book your perfect stay now
                </p>
                <button className="w-1/2 bg-[#F38B1E] rounded-md flex items-center justify-center p-2 text-white">
                  {planePaper}
                  <span> show Stays</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );

}
