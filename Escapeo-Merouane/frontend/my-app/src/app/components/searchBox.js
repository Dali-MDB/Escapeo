"use client";
import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext"; // Importing the Search Context
import { departicon, arrivalIcon, calendarIcon, searchIcon } from "../data/data";
import { useState } from "react";

export default function FlightSearch() {
  const { searchData, setSearchData } = useSearch();
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setSearchData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    router.push("/search/flight");
  };
  const [way,setWay] = useState("Round Trip")
  return (
    <div className="cursor-pointer text-center shadow-[10px_10px_35px_0_#a4b5c4] flex flex-col gap-5 items-start w-full> text-lg text-black py-3 px-10 pb-10 mx-auto bg-gray-100 rounded-2xl">
      {/* Trip Type Selection */}
      <div className="flex gap-4 border-b mb-2">
        {["Round Trip", "One-way trip"].map((type) => (
          <div
            key={type}
            className={`flex justify-center items-center gap-2 px-2 py-5 cursor-pointer ${
              way === type ? "shadow-[inset_0_-4px_0_black]" : ""
            }`}
            onClick={() => setWay(type)}
          >
            {type}
          </div>
        ))}
      </div>

      <div className="flex flex-row justify-evenly gap-5 items-center w-full">
        {/* From & To Fields */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-md px-2">From</legend>
          <div className="flex gap-5 py-3 items-center w-full">
            <input
              className="w-full bg-transparent text-lg outline-none"
              value={searchData.from}
              onChange={(e) => handleInputChange("from", e.target.value)}
            />
            {departicon}
          </div>
        </fieldset>

        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-md px-2">To</legend>
          <div className="flex gap-5 py-3 items-center w-full">
            <input
              className="w-full bg-transparent text-lg outline-none"
              value={searchData.to}
              onChange={(e) => handleInputChange("to", e.target.value)}
            />
            {arrivalIcon}
          </div>
        </fieldset>

        {/* Depart Date Picker */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-md px-2">Depart</legend>
          <div className="flex gap-5 py-3 items-center w-full">
            <input
              type="date"
              className="w-full bg-transparent text-lg outline-none"
              value={searchData.departDate}
              onChange={(e) => handleInputChange("departDate", e.target.value)}
            />
           </div>
        </fieldset>

        {/* Return Date Picker (if Round Trip) */}
        {way === "Round Trip" && (
          <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
            <legend className="text-md px-2">Return</legend>
            <div className="flex gap-5 py-3 items-center w-full">
              <input
                type="date"
                className="w-full bg-transparent text-lg outline-none"
                value={searchData.returnDate}
                onChange={(e) => handleInputChange("returnDate", e.target.value)}
              />
            </div>
          </fieldset>
        )}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
            <legend className="text-md px-2">Passengers - Class</legend>
            <div className="flex gap-5 py-3 items-center w-full">
            <input
                type="text"
                className="w-full bg-transparent text-lg outline-none"
                value={searchData.passengers}
                onChange={(e) => handleInputChange("passengers", e.target.value)}
              />
              <input
                type="text"
                className="w-full bg-transparent text-lg outline-none"
                value={searchData.classType}
                onChange={(e) => handleInputChange("classType", e.target.value)}
              />
              
            </div>
          </fieldset>
        <div className="w-full max-w-10 flex flex- row justify-end items-center">
        <button onClick={handleSearch} className="w-50 bg-[#F38B1E] p-3 rounded-lg">
        {searchIcon}
      </button></div>
      </div>

      {/* Search Button */}
      
    </div>
  );
}
