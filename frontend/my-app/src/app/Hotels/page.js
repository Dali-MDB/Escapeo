"use client";
import { staysDest, stays } from "../data/data";
import NavBar from "../components/NavBar";
import Image from "next/image";
import UniqueStayCard from "../UniqueStaysCard";

import { useState } from "react";
import {
  calendarIcon,
  searchIcon,
  filtersIcon,
  staysIcon,
  services,
  personIcon,
  BigOffers,
} from "../data/data";

import Link from "next/link";


import StayBox from "@/app/components/StayBox"


const StaysSection = ({ stays, valuesToShow }) => {

  // Map filter categories to fields in your stay object

  return (
    <div className="flex mt-2 w-[80%] mx-auto justify-start gap-2 flex-row h-full overflow-hidden ">
      {/* First row - 8 buttons */}
      {stays
        .slice(0, valuesToShow)
        .map((stay, index) => (
          <div key={index}>
            <StayBox hotel={stay} />
          </div>
        ))}
    </div>
  );
};

import HotelSearch from "../components/HotelSearch";
const Hero = ({ children }) => (
  <div className="w-full   mt-20  h-[88vh] relative   mx-auto  py-2 flex flex-col  justify-start  items-center  ">
    <div className="bg-no-repeat h-3/4  w-[90%] bg-[url('/coverStays.png')] bg-center bg-cover  rounded-3xl">
      {/** */}
    </div>
    <div className="absolute bottom-20 w-[80%]">
      {children}
    </div>
  </div>
);

import { useEffect } from "react";
import { API_URL } from "../utils/constants";
import { Star, StarIcon } from "lucide-react";
const Hotels = () => {

  const [stays, setStays] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [valuesToShow, setValuesToShow] = useState(10)

  const fetchStays = async (params = {}) => {
    setIsLoading(true);
    try {
      // Convert params to URL query string
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_URL}/hotels/search/${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hotels");
      }

      const data = await response.json();
      setStays(data);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      alert("Error fetching hotels: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load with no filters
    fetchStays();
  }, []);

  const handleSearch = (searchParams) => {
    setValuesToShow(10); // Reset pagination on new search
    fetchStays(searchParams);
  };

  return (
    <div className="min-h-screen relative  bg-[#EEDAC4] py-5">
      <NavBar />
      <Hero>
        <HotelSearch onSearch={handleSearch} />
      </Hero>
      {isLoading ? (
        <div className="w-full flex justify-center py-20">
          <p>Loading hotels...</p>
        </div>
      ) : stays.length === 0 ? (
        <div className="w-full flex justify-center py-20">
          <p>No hotels found matching your criteria</p>
        </div>
      ) : (
        <>
          <StaysSection stays={stays} valuesToShow={valuesToShow} />
          {stays.length > valuesToShow && (
            <div className="w-[90%] mx-auto py-10 text-center flex justify-center items-center">
              <button
                className="text-center py-4 w-2/3 text-xl text-white bg-[var(--primary)] rounded-xl"
                onClick={() => setValuesToShow(valuesToShow + 10)}
              >
                Show More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
};

export default Hotels;

