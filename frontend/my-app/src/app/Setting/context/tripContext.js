"use client";

import { createContext, useState, useContext } from "react";
import { API_URL } from "@/app/utils/constants";

export const TripContext = createContext();

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}

export function TripProvider({ children }) {
 
  const fetchDetails = async (tripId) => {
    if (!tripId) return null;
    
    try {
      const response = await fetch(`${API_URL}/trip_details/${tripId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      alert("Fetch error:", err);
      return null;
    } 
  };

  const fetchDeparture = async (tripId, departureId) => {
    const details = await fetchDetails(tripId);
    return details?.departure_places?.find(el => el.id === departureId);
  };

  return (
    <TripContext.Provider value={{ 
      fetchDetails, 
      fetchDeparture 
    }}>
      {children}
    </TripContext.Provider>
  );
}