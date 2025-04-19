"use client"
import { createContext, useState, useContext } from "react";

// Create the context
export const TripContext = createContext(null);

export function useTrip() {
  return useContext(TripContext);
}

export function TripProvider({ children }) {
  


const PRICE_CATEGORIES = [
  { value: "economy", label: "Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
  // Add other valid options from your backend
];

const DESTINATION_TYPES = [
  { value: "city", label: "City" },
  { value: "beach", label: "Beach" },
  { value: "mountain", label: "Mountain" }, // Add other valid options from your backend
  { value: "island", label: "Island" },
  { value: "cruise", label: "Cruise" },
];

const TRANSPORT_TYPES = [
  { value: "car", label: "Car" }, // Add other valid options from your backend
  { value: "bus", label: "Bus" },
  { value: "air-plane", label: "Airplane" },
  { value: "cruise", label: "Cruise" },
];

const EXPERIENCE_LEVELS = [

  { value: "adventure", label: 'Adventure' },
  { value: "cultural", label: 'Cultural' },
  { value: "eco     ", label: 'Eco' },
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
  // Add other valid options from your backend
];


const INITIAM_FORM_STATE = {
  title: "",
  description: "",
  capacity: 1,
  sold_tickets: 0,
  trip_type: TRIP_TYPES[0].value,
  experience: EXPERIENCE_LEVELS[0].value,
  price_category: PRICE_CATEGORIES[0].value,
  destination: "",
  destination_type: DESTINATION_TYPES[0].value,
  transport: TRANSPORT_TYPES[0].value,
  stars_rating: 3,
  departure_date: "",
  return_date: "",
  is_one_way: false,
  airlineCompany: "",
  departureTime: "",
  arrivalTime: "",
  from: "",
  departure_places: [{ location: "", capacity: 1, price: 0 }]
}
const [formData, setFormData] = useState(INITIAM_FORM_STATE);
  
  return (
    <TripContext.Provider value={{ formData , setFormData, PRICE_CATEGORIES, DESTINATION_TYPES, TRANSPORT_TYPES, EXPERIENCE_LEVELS, TRIP_TYPES }}>
      {children}
    </TripContext.Provider>
  );
}