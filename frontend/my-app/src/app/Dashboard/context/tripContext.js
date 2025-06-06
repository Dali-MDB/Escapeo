"use client"
import { createContext, useState, useContext } from "react";
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
    return_date: null,
    is_one_way: false,
    airlineCompany: "",
    departureTime: "",
    arrivalTime: null,
    from: "",
    guide: ""
  }
  const [formData, setFormData] = useState(INITIAM_FORM_STATE);
  const [tripImages, setTripImages] = useState([])
  const [departures, setDepartures] = useState([{ location: "", capacity: 0, price: 0, sold_tickets: 0 }])
  const [tripSelected, setTripSelected] = useState(0);
  const guides = [{ name: 'John Doe', id: 1 }, { name: 'Jane Smith', id: 2 }, { name: 'Alice Johnson', id: 3 }]
  return (
    <TripContext.Provider
      value={{
        tripImages, setTripImages, departures, setDepartures, formData, INITIAM_FORM_STATE, setFormData, setTripSelected, tripSelected, PRICE_CATEGORIES, DESTINATION_TYPES, TRANSPORT_TYPES, EXPERIENCE_LEVELS, TRIP_TYPES, guides
      }}>
      {children}
    </TripContext.Provider>
  );
}