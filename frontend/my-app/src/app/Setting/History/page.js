"use client";

import { useEffect, useState } from "react";
import { flightIcon, staysIcon } from "@/app/data/data";
import { API_URL } from "@/app/utils/constants";
import { useTrip } from "../context/tripContext";

const HistoryBox = ({
  created_at,
  date,
  departure_location,
  hotel_reservation,
  status,
  tickets,
  total_price,
  trip_title
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };





  return (
    <div className="w-full flex justify-evenly gap-2 p-4  rounded-xl  bg-white  shadow-sm hover:shadow-md transition-shadow">


      {[{
        label: "Trip",
        value: trip_title
      }, {
        label: "Departure",
        value: departure_location
      }, {
        label: "Tickets",
        value: tickets
      }, {
        label: "Price",
        value: total_price
      }, {
        label: "Status",
        value: status
      }, {
        label: "Date",
        value: formatDate(date)
      }
      ].map((el,index) => (
      <div key={index} className="flex justify-between items-center gap-2">
        <span className="text-lg  font-semibold text-black">{el.label}:
        </span>
        <span className={`font-medium text-md ${el.label === "Status" ? "text-[var(--secondary)]" :"text-[var(primary)]" } `}>{el.value}</span>
      </div>
      ))}

    </div>
  );
};

const HistorySection = ({ data, loading, error }) => {
  const { fetchDetails, fetchDeparture } = useTrip();
  const [tripTitles, setTripTitles] = useState({});
  const [departureLocations, setDepartureLocations] = useState({});

  useEffect(() => {
    if (data?.pending) {
      const fetchAllData = async () => {
        const newTripTitles = {};
        const newDepartureLocations = {};

        for (const item of data.pending) {
          try {
            // Fetch trip title
            const details = await fetchDetails(item.trip);
            newTripTitles[item.trip] = details?.title || 'N/A';

            // Fetch departure location
            const departure = await fetchDeparture(item.trip, item.departure_trip);
            newDepartureLocations[`${item.trip}-${item.departure_trip}`] = departure?.location || 'N/A';
          } catch (err) {
            console.error("Error fetching data:", err);
            newTripTitles[item.trip] = 'Error';
            newDepartureLocations[`${item.trip}-${item.departure_trip}`] = 'Error';
          }
        }

        setTripTitles(newTripTitles);
        setDepartureLocations(newDepartureLocations);
      };

      fetchAllData();
    }
  }, [data, fetchDetails, fetchDeparture]);

  if (loading) return <div className="text-center py-10">Loading history...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading history: {error}</div>;
  if (!data?.pending || data.pending.length === 0) return <div className="text-center py-10">No history found</div>;

  return (
    <div className="w-full py-0 px-2 flex flex-col gap-2">

      {data.pending.map((item) => (
        <HistoryBox
          key={item.id}
          created_at={item.created_at}
          date={item.date}
          departure_location={departureLocations[`${item.trip}-${item.departure_trip}`] || 'Loading...'}
          hotel_reservation={item.hotel_reservation}
          status={item.status}
          tickets={item.tickets}
          total_price={item.total_price}
          trip_title={tripTitles[item.trip] || 'Loading...'}
        />
      ))}
    </div>
  );
};

export default function History() {
  const [choice, setChoice] = useState("Flights");
  const [flights, setFlights] = useState({ pending: [] });
  const [stays, setStays] = useState({ pending: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/reservation/view_my_reservations/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFlights({ pending: data.trip_reservations.pending || [] });
        setStays({ pending: data.hotel_reservations.pending || [] });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="w-full py-0 px-2 flex flex-col gap-6">
      <div className="flex flex-row rounded-xl justify-center items-center px-5 gap-4 border-b mb-0 bg-[var(--bg-color)]">
        <button
          className={`w-[80%] flex h-full py-7 justify-start items-center gap-2 cursor-pointer ${choice === "Flights"
            ? "shadow-[inset_0_-4px_0_var(--primary)] text-[var(--primary)]"
            : "text-gray-500"
            }`}
          onClick={() => setChoice("Flights")}
        >
          {flightIcon} Flights
        </button>
        <button
          className={`flex h-full w-[80%] py-7 justify-start items-center gap-2 cursor-pointer ${choice === "Stays"
            ? "shadow-[inset_0_-4px_0_var(--primary)] text-[var(--primary)]"
            : "text-gray-500"
            }`}
          onClick={() => setChoice("Stays")}
        >
          {staysIcon} Stays
        </button>
      </div>

      <HistorySection
        data={choice === 'Flights' ? flights : stays}
        loading={loading}
        error={error}
      />
    </div>
  );
}