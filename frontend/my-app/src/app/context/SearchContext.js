"use client"
import { createContext, useState, useContext, useCallback } from "react";
import { API_URL } from "../utils/constants";

// Create Search Context
const SearchContext = createContext();

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }) {
  // Constants (unchanged)
  const PRICE_CATEGORIES = [
    { value: "economy", label: "Economy" },
    { value: "business", label: "Business" },
    { value: "first", label: "First Class" },
  ];

  const DESTINATION_TYPES = [
    { value: "city", label: "City" },
    { value: "beach", label: "Beach" },
    { value: "mountain", label: "Mountain" },
    { value: "island", label: "Island" },
    { value: "cruise", label: "Cruise" },
  ];

  const TRANSPORT_TYPES = [
    { value: "car", label: "Car" },
    { value: "bus", label: "Bus" },
    { value: "air-plane", label: "Airplane" },
    { value: "cruise", label: "Cruise" },
  ];

  const EXPERIENCE_LEVELS = [
    { value: "adventure", label: 'Adventure' },
    { value: "cultural", label: 'Cultural' },
    { value: "eco", label: 'Eco' },
    { value: "wellness", label: 'Wellness' },
    { value: "romantic", label: 'Romantic' },
    { value: "festival", label: 'Festival' },
  ];

  const TRIP_TYPES = [
    { value: "standard", label: "Standard" },
    { value: "all_inclusive", label: "All Inclusive" },
    { value: "group", label: "Group" },
    { value: "solo", label: "Solo" },
    { value: "road_trip", label: "Road Trip" },
  ];

  // State with array-based filters
  const [searchData, setSearchData] = useState({
    departure_city: "",
    destination: "",
    departure_date: "",
    return_date: "",
    passengers: 1,
    class_type: PRICE_CATEGORIES[0].value,
    trip_type: "round_trip"
  });

  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    min_price: 0,
    max_price: 10000,
    min_discount: 0,
    max_discount: 100,
    min_stars: 0,
    max_stars: 5,
    trip_types: [], // Now an array
    experiences: [], // Now an array
    destination_types: [], // Now an array
    transports: [], // Now an array
    sort: "departure_date",
    ascending: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [flights, setFlights] = useState([]);
  

  const executeSearch = useCallback(async (additionalParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Combine all parameters
      const params = {
        // Basic search parameters
        departure_city: searchData.departure_city,
        destination: searchData.destination,
        departure_date: searchData.departure_date,
        return_date: searchData.return_date,
        is_one_way: searchData.trip_type === "one_way",

        // Filter parameters
        ...(filters.min_price !== '' && { min_price: filters.min_price }),
        ...(filters.max_price !== '' && { max_price: filters.max_price }),
        ...(filters.min_discount !== 0 && { min_discount: filters.min_discount }),
        ...(filters.max_discount !== 100 && { max_discount: filters.max_discount }),
        ...(filters.min_stars !== '' && { min_stars: filters.min_stars }),
        ...(filters.max_stars !== '' && { max_stars: filters.max_stars }),

        // Array parameters
        ...(filters.trip_types.length > 0 && { trip_type: filters.trip_types }),
        ...(filters.experiences.length > 0 && { experience: filters.experiences }),
        ...(filters.destination_types.length > 0 && { destination_type: filters.destination_types }),
        ...(filters.transports.length > 0 && { transport: filters.transports }),



        // Sorting
        sort: filters.sort,
        ascending: filters.ascending,

        // Additional parameters
        ...additionalParams
      };

      // Create URLSearchParams
      const queryParams = new URLSearchParams();

      // Add basic parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      // Add array parameters (multiple values with same key)
      const arrayFilters = {
        trip_type: filters.trip_types,
        experience: filters.experiences,
        destination_type: filters.destination_types,
        transport: filters.transports
      };

      Object.entries(arrayFilters).forEach(([key, values]) => {
        if (values && values.length > 0) {
          values.forEach(value => {
            queryParams.append(key, value);
          });
        }
      });

      const queryString = queryParams.toString();
      console.log(`Request URL: ${API_URL}/search_trips/?${queryString}`);

      const response = await fetch(`${API_URL}/search_trips/?${queryString}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch trips');
      }

      const data = await response.json();
      console.log(data)
      setResults(data);

    } catch (err) {
      setError(err.message || 'An unknown error occurred');
      console.error("Search error:", err);
        } finally {
      setLoading(false);
    }
  }, [searchData, filters]);

  // Helper to update array filters
  const updateArrayFilter = useCallback((filterName, value, checked) => {
    setFilters(prev => {
      const currentArray = prev[filterName] || [];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);

      return {
        ...prev,
        [filterName]: newArray
      };
    });
  }, []);

  // Update price range helper
  const updatePriceRange = useCallback((newRange) => {
    setFilters(prev => ({
      ...prev,
      priceRange: newRange,
      min_price: newRange[0],
      max_price: newRange[1]
    }));
  }, []);

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters({
      priceRange: [0, 10000],
      min_price: 0,
      max_price: 10000,
      min_discount: 0,
      max_discount: 100,
      min_stars: 0,
      max_stars: 5,
      trip_types: [],
      experiences: [],
      destination_types: [],
      transports: [],
      sort: "departure_date",
      ascending: true
    });
  }, []);

  return (
    <SearchContext.Provider
      value={{
        PRICE_CATEGORIES,
        DESTINATION_TYPES,
        TRANSPORT_TYPES,
        EXPERIENCE_LEVELS,
        TRIP_TYPES,
        searchData,
        setSearchData,
        filters,
        setFilters,
        updateArrayFilter,
        updatePriceRange,
        resetFilters,
        executeSearch,
        loading,
        error,
        results
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}