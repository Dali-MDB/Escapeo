"use client"
import { createContext, useState, useContext } from "react";

// Create the context
export const TripContext = createContext(null);

export function useTrip() {
  return useContext(TripContext);
}

export function TripProvider({ children }) {
  const [tripData, setTripData] = useState({
    airlineCompany:"",
    date:"",
    from:"",
    destination:"",
    departureTime:"",
    arrivalTime:"",
});

  return (
    <TripContext.Provider value={{ tripData , setTripData }}>
      {children}
    </TripContext.Provider>
  );
}