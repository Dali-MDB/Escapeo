"use client";
import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import { departicon, arrivalIcon, calendarIcon, searchIcon } from "../data/data";
import { useState, useEffect } from "react";
import { FaPlaneDeparture, FaPlaneArrival, FaCalendar } from "react-icons/fa";
import { PriceChange } from "@mui/icons-material";
import CustomDropdown from "../Dashboard/Components/DropDown";
const SearchInputFields = ({ label, field, placeholder, searchData, setSearchData, min, disabled, icon }) => (
  <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4">
    <legend className="text-md px-2">{label}</legend>
    <div className="flex gap-5 py-3 items-center w-full">
      {icon}
      <input
        className="w-full bg-transparent text-lg outline-none"
        type={label === 'Depart' || label === 'Return' ? 'date' : 'text'}
        value={searchData[field] || ""}
        onChange={(e) => setSearchData(prev => ({...prev, [field]: e.target.value}))}
        placeholder={placeholder}
        min={min}
        disabled={disabled}
      />
    </div>
  </fieldset>
);

export default function FlightSearch() {
  const { searchData, setSearchData, flights , setFlights ,executeSearch , results , PRICE_CATEGORIES } = useSearch();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const r =  executeSearch({
      // Only pass basic search parameters
      departure_city: searchData.departure_city,
      destination: searchData.destination,
      departure_date: searchData.departure_date,
      return_date: searchData.return_date,
      is_one_way: searchData.is_one_way
    });
    if (r) {
      router.push('/search/flight')
    }
  };
  
  const [way, setWay] = useState(
    searchData.is_one_way !== undefined
      ? searchData.is_one_way ? "One-way trip" : "Round Trip"
      : "Round Trip"
  );

  // Initialize search data with proper field names
 

  const isSearchDisabled = () => {
    const requiredFields = [
      'departure_city',
      'destination',
        ];
    return requiredFields.some(field => !searchData[field]);
  };

  const handleWayChange = (wayType) => {
    setWay(wayType);
    const isOneWay = wayType === "One-way trip";
    setSearchData(prev => ({
      ...prev,
      is_one_way: isOneWay,
      return_date: isOneWay ? "" : prev.return_date
    }));
  };

  

  return (
    <div className="cursor-pointer text-center shadow-[10px_10px_35px_0_#a4b5c4] flex flex-col gap-5 items-start w-full text-lg text-black py-3 px-10 pb-10 mx-auto bg-gray-100 rounded-2xl">
      {/* Trip Type Selection */}
      <div className="flex gap-4 mb-2">
        {["Round Trip", "One-way trip"].map((type) => (
          <div
            key={type}
            className={`flex justify-center items-center gap-2 px-2 py-5 cursor-pointer ${
              way === type ? "shadow-[inset_0_-4px_0_var(--primary)]" : ""
            }`}
            onClick={() => handleWayChange(type)}
          >
            {type}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row justify-evenly gap-5 items-center justify-center w-full">
        {[
          { field: "departure_city", label: "From", placeholder: "City or Airport", icon: <FaPlaneDeparture size={30} /> },
          { field: "destination", label: "To", placeholder: "City or Airport", icon: <FaPlaneArrival size={30} /> },
          { field: "depart_date", label: "Depart", placeholder: "", icon: <FaCalendar size={30} /> }
        ].map((el, index) => (
          <SearchInputFields key={index} {...el} searchData={searchData} setSearchData={setSearchData} />
        ))}

        {way === "Round Trip" && (
          <SearchInputFields
            field="return_date"
            label="Return"
            placeholder=""
            searchData={searchData}
            setSearchData={setSearchData}
            min={searchData.depart_date}
            disabled={!searchData.depart_date}
            icon={<FaCalendar size={30} />}
          />
        )}

        {/* Passengers and Class */}
        

        {/* Search Button */}
        <div className="w-full max-w-10 h-full flex flex-row justify-center items-end">
          <button
            onClick={handleSubmit}
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