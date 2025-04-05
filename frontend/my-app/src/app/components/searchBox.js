"use client";
import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import { departicon, arrivalIcon, calendarIcon, searchIcon } from "../data/data";
import { useState, useEffect } from "react";

export default function FlightSearch() {
  const { searchData, setSearchData, filters } = useSearch();
  const router = useRouter();
  
  // Initialize with default values if empty
  const [way, setWay] = useState(
    filters.is_one_way !== undefined 
      ? filters.is_one_way ? "One-way trip" : "Round Trip" 
      : "Round Trip"
  );

  // Check if all required fields are filled
  const isSearchDisabled = () => {
    const requiredFields = [
      'from', 
      'to', 
      'departDate',
      ...(way === "Round Trip" ? ['returnDate'] : [])
    ];
    
    return requiredFields.some(field => !searchData[field] || searchData[field] === "");
  };

  // Initialize search data with defaults if empty
  useEffect(() => {
    setSearchData(prev => ({
      from: prev.from || "",
      to: prev.to || "",
      departDate: prev.departDate || "",
      returnDate: prev.returnDate || "",
      passengers: prev.passengers || 1,
      classType: prev.classType || "Economy",
      is_one_way: way === "One-way trip"
    }));
  }, []);

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleWayChange = (wayType) => {
    setWay(wayType);
    const isOneWay = wayType === "One-way trip";
    setSearchData(prev => ({
      ...prev,
      is_one_way: isOneWay,
      // Clear return date if switching to one-way
      ...(isOneWay && { returnDate: "" })
    }));
  };

  const handleSearch = () => {
    if (isSearchDisabled()) return;
    
    // Ensure return date is after departure date for round trips
    if (way === "Round Trip" && new Date(searchData.returnDate) < new Date(searchData.departDate)) {
      alert("Return date must be after departure date");
      return;
    }

    router.push("/search/flight");
  };

  return (
    <div className="cursor-pointer text-center shadow-[10px_10px_35px_0_#a4b5c4] flex flex-col gap-5 items-start w-full text-lg text-black py-3 px-10 pb-10 mx-auto bg-gray-100 rounded-2xl">
      {/* One-way/Round Trip Selection */}
      <div className="flex gap-4 border-b mb-2">
        {["Round Trip", "One-way trip"].map((type) => (
          <div
            key={type}
            className={`flex justify-center items-center gap-2 px-2 py-5 cursor-pointer ${
              way === type ? "shadow-[inset_0_-4px_0_black]" : ""
            }`}
            onClick={() => handleWayChange(type)}
          >
            {type}
          </div>
        ))}
      </div>

      <div className="flex flex-row justify-evenly gap-5 items-center w-full">
        {/* From Field */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-md px-2">From</legend>
          <div className="flex gap-5 py-3 items-center w-full">
            <input
              className="w-full bg-transparent text-lg outline-none"
              value={searchData.from || ""}
              onChange={(e) => handleInputChange("from", e.target.value)}
              placeholder="City or Airport"
            />
            {departicon}
          </div>
        </fieldset>

        {/* To Field */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-md px-2">To</legend>
          <div className="flex gap-5 py-3 items-center w-full">
            <input
              className="w-full bg-transparent text-lg outline-none"
              value={searchData.to || ""}
              onChange={(e) => handleInputChange("to", e.target.value)}
              placeholder="City or Airport"
            />
            {arrivalIcon}
          </div>
        </fieldset>

        {/* Depart Date */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-md px-2">Depart</legend>
          <div className="flex gap-5 py-3 items-center w-full">
            <input
              type="date"
              className="w-full bg-transparent text-lg outline-none"
              value={searchData.departDate || ""}
              onChange={(e) => handleInputChange("departDate", e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
          </div>
        </fieldset>

        {/* Return Date (only for round trips) */}
        {way === "Round Trip" && (
          <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
            <legend className="text-md px-2">Return</legend>
            <div className="flex gap-5 py-3 items-center w-full">
              <input
                type="date"
                className="w-full bg-transparent text-lg outline-none"
                value={searchData.returnDate || ""}
                onChange={(e) => handleInputChange("returnDate", e.target.value)}
                min={searchData.departDate || new Date().toISOString().split('T')[0]}
                disabled={!searchData.departDate}
              />
            </div>
          </fieldset>
        )}

        {/* Passengers and Class */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
          <legend className="text-md px-2">Passengers - Class</legend>
          <div className="flex gap-5 py-3 items-center w-full">
            <input
              type="number"
              className="w-full bg-transparent text-lg outline-none"
              value={searchData.passengers || "" }
              onChange={(e) => handleInputChange("passengers", Math.max(1, e.target.value))}
              min="1"
            />
            <select
              className="w-full bg-transparent text-lg outline-none"
              value={searchData.classType || "" }
              onChange={(e) => handleInputChange("classType", e.target.value)}
            >
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </div>
        </fieldset>

        {/* Search Button */}
        <div className="w-full max-w-10 h-full  flex flex-row justify-center items-end">
          <button 
            onClick={handleSearch} 
            className={`w-50 p-3 rounded-lg flex items-center justify-center ${
              isSearchDisabled() 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-[#F38B1E] hover:bg-[#e07d1a]"
            }`}
            disabled={isSearchDisabled()}
          >
            {searchIcon}
          </button>
        </div>
      </div>
    </div>
  );
}