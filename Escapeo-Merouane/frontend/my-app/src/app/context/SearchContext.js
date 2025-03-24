"use client"
import { createContext, useState, useContext } from "react";

// Create Search Context
const SearchContext = createContext();

export function useSearch() {return useContext(SearchContext);}

export function SearchProvider({ children }) {
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    tripType: "",
    departDate: "",
    returnDate: "",
    passengers: 1,
    classType: "Economy",
  });
const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    departureTimeRange: ["0", "720"],
    rating: 0,
    tripType: "",
    experienceType: "",
    destinationType: "",
    transportType: "",
  });
  return (
    <SearchContext.Provider value={{ searchData, setSearchData , filters , setFilters }}>
      {children}
    </SearchContext.Provider>
  );
};
