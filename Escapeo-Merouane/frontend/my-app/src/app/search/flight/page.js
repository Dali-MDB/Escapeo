"use client";

import NavBar from "@/app/components/NavBar";
import { useSearch } from "../../context/SearchContext"
import { useState } from "react";
import Image from "next/image";
import FlightSearch from "@/app/components/searchBox";
import FiltersBar from "../components/filtersBar";

const FlightSearchPage = () => {
  const { searchData, setSearchData } = useSearch();
 
  // Handle Filter Change
 

  return (
    <div className="bg-[#EEDAC4] px-0 pt-20 m-0 w-full min-h-screen ">
      <NavBar />
      <div className="w-[90%] mx-auto py-20">
      <FlightSearch />
      </div>
      {/* Sidebar Filters */}
      

      {/* Search Results */}
      <main className="flex w-[90%] mx-auto flex-row gap-16 py-4">
        <FiltersBar />
        <h1 className="text-2xl font-bold mb-4">Flight Search Results</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Mock flight result component */}
          <div className="border p-4 rounded shadow-md">
            <Image width={500} height={500} src="/airline.jpg" alt="Airline" className="w-full h-40 object-cover" />
            <h2 className="text-lg font-bold mt-2">Airline Name</h2>
            <p>Price: $500</p>
            <p>Depart: 10:00 AM | Return: 8:00 PM</p>
            <p>Rating: ⭐⭐⭐⭐</p>
            <div className="flex justify-between mt-2">
              <button className="bg-gray-300 px-4 py-2 rounded">❤️ Favorite</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">View Details</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlightSearchPage;