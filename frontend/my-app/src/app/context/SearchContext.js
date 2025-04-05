"use client"
import { createContext, useState, useContext } from "react";

// Create Search Context
const SearchContext = createContext();

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }) {
  // Basic search parameters
  const [searchData, setSearchData] = useState({
    departure_city: "",
    destination: "",
    trip_type: "round", // Default to "round" instead of empty string
    departure_date: "", // Consider using Date objects or ISO strings
    return_date: "",
    passengers: 1,
    class_type: "Economy",
    // Removed is_one_way since it's derived from trip_type
  });

  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    min_price: 0,
    max_price: 10000,
    min_discount: 0,
    max_discount: 100, // Changed from 0 to 100 if it's percentage
    min_stars: 0,
    max_stars: 5, // Assuming 5-star rating system
    departureTimeRange: ["00:00", "23:59"], // More intuitive than minutes
    trip_type: [],
    experience: [],
    destination_type: [],
    transport: [],
    sort: "departure_date",
    ascending: true,
    // Removed duplicate is_one_way
  });

  // Update price filters when range changes
  const updatePriceRange = (newRange) => {
    setFilters(prev => ({
      ...prev,
      priceRange: newRange,
      min_price: newRange[0],
      max_price: newRange[1]
    }));
  };
  const validateSearch = () => {
    if (!searchData.departure_city || !searchData.destination) {
      throw new Error('Departure and destination are required');
    }
    if (searchData.trip_type === 'round' && !searchData.return_date) {
      throw new Error('Return date is required for round trips');
    }
  };
  // Combine all search parameters for API request
  const getSearchParams = () => {
    return {
      // Basic search
      ...searchData,
      is_one_way: searchData.trip_type === "one-way",
      
      // Price filters
      min_price: filters.priceRange[0],
      max_price: filters.priceRange[1],
      
      // Other filters
      ...(filters.min_discount && { min_discount: filters.min_discount }),
      ...(filters.max_discount && { max_discount: filters.max_discount }),
      ...(filters.min_stars && { min_stars: filters.min_stars }),
      ...(filters.max_stars && { max_stars: filters.max_stars }),
      
      // Convert arrays to comma-separated strings
      ...(filters.trip_type.length > 0 && { trip_type: filters.trip_type.join(",") }),
      ...(filters.experience.length > 0 && { experience: filters.experience.join(",") }),
      ...(filters.destination_type.length > 0 && { destination_type: filters.destination_type.join(",") }),
      ...(filters.transport.length > 0 && { transport: filters.transport.join(",") }),
      
      // Sorting
      sort: filters.sort,
      ascending: filters.ascending,
    };
  };

  return (
    <SearchContext.Provider 
      value={{ 
        searchData, 
        setSearchData,
        filters,
        setFilters,
        updatePriceRange, // Special function for price updates
        getSearchParams
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};