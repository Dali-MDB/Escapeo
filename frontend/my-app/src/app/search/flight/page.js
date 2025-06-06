"use client";

import NavBar from "@/app/components/NavBar";
import { useSearch } from "../../context/SearchContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import FlightSearch from "@/app/components/searchBox";
import FiltersBar from "../components/filtersBar";
import { fetchTrips } from "../../utils/auth";
import { useRouter } from "next/navigation";
import { BigOffers } from "@/app/data/data";
import FlightBox from "@/app/components/FlightBox";


const FlightSearchPage = () => {
  const { searchData, setSearchData ,  results } = useSearch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  

    return (
    <div className="bg-[#EEDAC4] px-0 pt-20 m-0 w-full min-h-screen">
      <NavBar />
      <div className="w-[90%] mx-auto py-20">
        <FlightSearch />
      </div>

      <main className="flex w-[90%] mx-auto flex-row gap-16 py-4">
        <FiltersBar />
        {
           <div className="flex flex-col gap-4 w-full">
             <div className="flex flex-col gap-4">
               {results.map((flight, index) => (
                 <FlightBox key={index}
                 link={"/TripDetail"}
                 backgroundImage={flight?.images[0]?.image }
                 title={flight.title}
                 description={flight.description}
                 price={flight.departure_places[0]?.price}
                 id={flight.id}
                  />
               ))}
             </div>
             {results.length === 0 && (
               <div className="flex items-center justify-center h-64">
                 <h1 className="text-xl font-bold">No flights found</h1>
               </div>
             )}
             <div className="flex justify-center mt-4">
               <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                 Load More
               </button>
             </div>
           </div>
          
          } 
          <div className="hidden md:block w-1/4">
            {/* Additional content can go here */}
          </div>      
      </main>
    </div>
  );
};

const FlightCard = ({ flight }) => {
  // Format price with discount if available

  return (
    <div className="border p-4 rounded shadow-md bg-white">
      <Image
        width={500}
        height={500}
        src={flight.image || "/airline.jpg"}
        alt={flight.airline}
        className="w-full h-40 object-cover"
      />
      <h2 className="text-lg font-bold mt-2">{flight.airline}</h2>






      <div className="flex justify-between mt-4">
        <button className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">
          ❤️ Save
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
          View Details
        </button>
      </div>
    </div>
  );
};

export default FlightSearchPage;