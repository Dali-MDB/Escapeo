"use client";

import NavBar from "../components/NavBar";

import { useEffect, useState } from "react";

import { API_URL } from "@/app/utils/constants";
import {
  filters,
  departicon,
  arrivalIcon,
  calendarIcon,
  searchIcon,
  filtersIcon,
  BigOffers,
} from "../data/data";
import FlightBox from "../components/FlightBox";
import FlightSearch from "../components/searchBox";

import { Description } from "@mui/icons-material";
import Link from "next/link";
import { useForm } from "../context/FormContext";
import Image from "next/image";





const Hero = () => (
  <div className="w-full  h-[60vh] sm:h-[80vh] mt-18 sm:mt-24  lg:h-screen relative   mx-auto  py-5 flex flex-col  justify-start lg:justify-center items-center flex-wrap sm:flex-nowrap  ">
    <div className="bg-no-repeat h-1/3  lg:h-3/4 w-[90%] bg-[url('/coverFlights.png')] bg-center bg-cover  rounded-3xl">
      {/** */}
    </div>
    <div className="absolute w-[80%] mx-auto mt-36 sm:mt-72 lg:mt-auto lg:bottom-[-50px]">
    {/*absolute bottom-[-120px] sm:bottom-[-50px] mt-96 pt-96 sm:mt-auto w-[80%]*/}
    {/*absolute w-[80%] mx-auto mt-36 sm:mt-72 lg:mt-auto lg:bottom-[50px]*/ }

      <FlightSearch />
    </div>
  </div>
);


const FilterButton = ({ value, label, borderColor, onToggle, isInitiallySelected }) => {
  const [isSelected, setIsSelected] = useState(isInitiallySelected);

  useEffect(() => {
    setIsSelected(isInitiallySelected);
  }, [isInitiallySelected]);

  const handleClick = () => {
    setIsSelected(!isSelected);
    onToggle(value, label);
  };

  return (
    <button
      name={value}
      id={label}
      onClick={handleClick}
      className={` sm:block px-4 w-fit sm:w-full py-2 rounded-full  shadow-[2px_-3px_10px_rgba(0,0,0,0.4)] 
        ${isSelected ? "bg-[#035280] text-white" : `bg-[var(--bg-color)] border-4 ${borderColor}`} 
        `}
    >
      {label}
    </button>
  );
};
const FilterSection = ({ setFiltersSet, filtersSet }) => {

  const handleFilterClick = (value, label) => {
    setFiltersSet((prevFilters) => {
      const alreadyExists = prevFilters.some(
        (f) => f.filter === value && f.value === label
      );

      if (alreadyExists) {
        // Remove it
        return prevFilters.filter(
          (f) => !(f.filter === value && f.value === label)
        );
      } else {
        // Add it
        return [...prevFilters, { filter: value, value: label }];
      }
    });
  };

  {/** */ }

  const PRICE_CATEGORIES = [
    { value: "economy", label: "Economy", borderColor: "border-red-500" },
    { value: "business", label: "Business", borderColor: "border-blue-500" },
    { value: "first", label: "First Class", borderColor: "border-green-500" },
    // Add other valid options from your backend
  ];

  const DESTINATION_TYPES = [
    { value: "city", label: "City", borderColor: "border-yellow-500" },
    { value: "beach", label: "Beach", borderColor: "border-purple-500" },
    { value: "mountain", label: "Mountain", borderColor: "border-pink-500" }, // Add other valid options from your backend
    { value: "island", label: "Island", borderColor: "border-gray-500" },
    { value: "cruise", label: "Cruise", borderColor: "border-orange-500" },
  ];

  const TRANSPORT_TYPES = [
    { value: "car", label: "Car" }, // Add other valid options from your backend
    { value: "bus", label: "Bus" },
    { value: "air-plane", label: "Airplane" },
    { value: "cruise", label: "Cruise" },
  ];

  const EXPERIENCE_LEVELS = [

    { value: "adventure", label: 'Adventure', borderColor: "border-red-500" },
    { value: "cultural", label: 'Cultural', borderColor: "border-blue-500" },
    { value: "eco     ", label: 'Eco', borderColor: "border-green-500" },
    { value: "wellness", label: 'Wellness', borderColor: "border-yellow-500" },
    { value: "romantic", label: 'Romantic', borderColor: "border-purple-500" },
    { value: "festival", label: 'Festival', borderColor: "border-pink-500" },

  ];
  const TRIP_TYPES = [
    { value: "standard", borderColor: "border-gray-500", label: "Standard" },
    { value: "all_inclusive", borderColor: "border-orange-500", label: "All Inclusive" },
    { value: "group", borderColor: "border-red-500", label: "Group" },
    { value: "solo", borderColor: "border-blue-500", label: "Solo" },
    { value: "road_trip", borderColor: "border-green-500", label: "Road Trip" },
    // Add other valid options from your backend
  ];

  return (
    <div className="w-full mt-[450px] sm:mt-[350px] lg:mt-36 mx-auto flex flex-col items-center gap-4 ">
      {/* w-full mt-48 sm:mt-36 mx-auto flex flex-col items-center gap-4*/}
      {/* First row - 8 buttons */}
      <div className="flex w-[80%] mx-auto justify-center gap-2 flex-row flex-wrap sm:flex-nowrap">

        {


          EXPERIENCE_LEVELS.map((filter, index) => (<FilterButton
            key={index}
            value={filter.value}
            label={filter.label}
            borderColor={filter.borderColor}
            isInitiallySelected={filtersSet.some(
              (f) => f.filter === filter.value && f.value === filter.label
            )}
            onToggle={handleFilterClick}
            
          />))}
      </div>

      {/* Second row - 9 buttons */}
      <div className="flex justify-center mx-auto gap-2 flex-row w-[90%] flex-wrap sm:flex-nowrap">
        {PRICE_CATEGORIES.map((filter, index) => (<FilterButton
          key={index}
          value={filter.value}
          label={filter.label}
          borderColor={filter.borderColor}
          isInitiallySelected={filtersSet.some(
            (f) => f.filter === filter.value && f.value === filter.label
          )}
          onToggle={handleFilterClick}
        />))}
        {DESTINATION_TYPES.map((filter, index) => (<FilterButton
          key={index}
          value={filter.value}
          label={filter.label}
          borderColor={filter.borderColor}
          isInitiallySelected={filtersSet.some(
            (f) => f.filter === filter.value && f.value === filter.label
          )}
          onToggle={handleFilterClick}
        />))}
      </div>

      {/* Third row - 8 buttons */}
      <div className="flex w-[80%] mx-auto  justify-center gap-2 flex-row flex-wrap sm:flex-nowrap">
        {TRIP_TYPES.map((filter, index) => (<FilterButton
          key={index}
          value={filter.value}
          label={filter.label}
          borderColor={filter.borderColor}
          isInitiallySelected={filtersSet.some(
            (f) => f.filter === filter.value && f.value === filter.label
          )}
          onToggle={handleFilterClick}
        />))}
      </div>
    </div >
  );
};






const FlightsSection = ({ flights, valuesToShow, filters }) => {
  const matchFlightToFilters = (flight) => {
    if (filters.length === 0) return true;

    return filters.some((f) => {
      const fieldName = findRelevantField(f.filter);
      return fieldName && flight[fieldName]?.toLowerCase() === f.filter.toLowerCase();
    });
  };

  // Map filter categories to fields in your flight object
  const findRelevantField = (filterValue) => {
    const mapping = {
      adventure: "experience",
      cultural: "experience",
      eco: "experience",
      wellness: "experience",
      romantic: "experience",
      festival: "experience",

      economy: "price_category",
      business: "price_category",
      first: "price_category",

      city: "destination_type",
      beach: "destination_type",
      mountain: "destination_type",
      island: "destination_type",
      cruise: "destination_type",

      car: "transport_type",
      bus: "transport_type",
      "air-plane": "transport_type",
      "airplane": "transport_type",
      cruise: "transport_type",

      standard: "trip_type",
      all_inclusive: "trip_type",
      group: "trip_type",
      solo: "trip_type",
      road_trip: "trip_type",
    };

    return mapping[filterValue.toLowerCase()] || null;
  };

  return (
    <div className="w-[90%] mx-auto py-10 px-4 mt-20 grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 justify-items-center">
      {flights
        .slice(0, valuesToShow)
        .filter(matchFlightToFilters)
        .map((flight, index) => (
          <FlightBox
            key={index}
            link={"/TripDetail"}
            backgroundImage={flight?.images[0]?.image }
            title={flight.title}
            description={flight.description}
            price={flight.departure_places[0]?.price}
            id={flight.id}
          />
        ))}
    </div>
  );
};


const Flights = () => {
  const [filtersSet, setFiltersSet] = useState([])
  const [error, setError] = useState("")
  const [flights, setFlights] = useState([])

  useEffect(() => {
    async function fetchRelatedFlights() {
      try {
        const response = await fetch(`${API_URL}/all_trips/`, {
          method: "GET",
          
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch related flights.");
        }else{
          const data = await response.json();
      setFlights(data)
        }
      } catch (err) {
        alert("error: " + err)
      }
      

    }
    fetchRelatedFlights()
     



  }, []);

  const [valuesToShow, setValuesToShow] = useState(10)

  return (
    <div className="bg-[#EEDAC4]   py-5">
      <NavBar />
      <Hero />
      <FilterSection setFiltersSet={setFiltersSet} filtersSet={filtersSet} />
      <FlightsSection filters={filtersSet} flights={flights} valuesToShow={valuesToShow} />
      <div className="w-[90%] mx-auto py-10 tetx-center flex justify-center items-center">
        <button className="text-center py-4 w-2/3  text-xl text-white bg-[var(--primary)] rounded-xl " onClick={() => {
          setValuesToShow(valuesToShow + 10)
        }}>
          Show More
        </button>
      </div>
    </div>
  );
}

export default Flights;
