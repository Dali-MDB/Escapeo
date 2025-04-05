"use client";

import NavBar from "@/app/components/NavBar";
import { useSearch } from "../../context/SearchContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import FlightSearch from "@/app/components/searchBox";
import FiltersBar from "../components/filtersBar";
import { fetchFlights } from "../../utils/auth";
import { useRouter } from "next/navigation";

const FlightSearchPage = () => {
  const { searchData, setSearchData   } = useSearch();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const loadFlights = async () => {
      try {
        const result = await fetchFlights(searchData);
        if (result.error) {
          throw new Error(result.error)
          } else {
          setFlights(result.results);
        }
      } catch (error) {
        console.error('Failed to load flights:', error);
        toast.error('Failed to load flights. Please try again.');
      }
    };
  
    loadFlights();
  }, [searchData]);
  return (
    <div className="bg-[#EEDAC4] px-0 pt-20 m-0 w-full min-h-screen">
      <NavBar />
      <div className="w-[90%] mx-auto py-20">
        <FlightSearch />
      </div>

      <main className="flex w-[90%] mx-auto flex-row gap-16 py-4">
        <FiltersBar />
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Flight Search Results</h1>
          
          {loading && <p>Loading flights...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flights.length > 0 ? (
              flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))
            ) : (
              !loading && <p>No flights found matching your criteria.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const FlightCard = ({ flight }) => {
  // Format price with discount if available
  const originalPrice = flight.price;
  const discountedPrice = flight.discount 
    ? originalPrice * (1 - flight.discount / 100)
    : originalPrice;

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
      
      <div className="flex justify-between items-center mt-2">
        {flight.discount ? (
          <>
            <span className="text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
            <span className="text-red-500 font-bold">${discountedPrice.toFixed(2)}</span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
              {flight.discount}% OFF
            </span>
          </>
        ) : (
          <span className="font-bold">${originalPrice.toFixed(2)}</span>
        )}
      </div>
      
      <p className="text-sm mt-2">
        Depart: {new Date(flight.departure_date).toLocaleString()} | 
        {flight.return_date && ` Return: ${new Date(flight.return_date).toLocaleString()}`}
      </p>
      
      <div className="flex items-center mt-1">
        <span className="text-yellow-500">
          {'★'.repeat(Math.round(flight.stars_rating))}
          {'☆'.repeat(5 - Math.round(flight.stars_rating))}
        </span>
        <span className="ml-1 text-sm">({flight.reviews_count})</span>
      </div>
      
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