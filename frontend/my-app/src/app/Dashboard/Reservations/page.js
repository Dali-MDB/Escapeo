"use client";

import { useEffect, useState } from "react";
import { flightIcon, staysIcon } from "@/app/data/data";
import { API_URL } from "@/app/utils/constants";
import { useTrip } from "@/app/Setting/context/tripContext";
import { useRouter } from "next/navigation";
import { Star, CalendarDays } from "lucide-react";
import { getMyProfile } from "@/app/utils/auth";

const HistoryBoxFlight = ({
  id,
  departure_location,
  status,
  tickets,
  total_price,
  trip_title,
  date,
  confirmReservation
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full flex justify-evenly gap-2 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      {[
        { label: "Trip", value: trip_title },
        { label: "Departure", value: departure_location },
        { label: "Tickets", value: tickets },
        { label: "Price", value: `$${total_price}` },
        { label: "Status", value: status },
        { label: "Date", value: formatDate(date) }
      ].map((el, index) => (
        <div key={index} className="flex justify-between items-center gap-2">
          <span className="text-lg font-semibold text-black">{el.label}:</span>
          <span className={`font-medium text-lg ${el.label === "Status" ? "text-[var(--secondary)]" : "text-[var(--primary)]"}`}>
            {el.value}
          </span>
        </div>
      ))}
     
      <button
        className="w-fit rounded-xl font-semibold px-4 py-2 bg-[var(--secondary)] text-[var(--bg-color)]"
        onClick={(e) => confirmReservation(id, false)}
      >
        Accept
      </button>
    </div>
  );
};

const HistoryBoxStay = ({
  id,
  hotel_reservation,
  status,
  confirmReservation
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full grid grid-cols-4 items-start gap-4 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col w-full">
        <span className="text-lg font-semibold text-black">Hotel:</span>
        <span className="font-medium text-lg text-[var(--primary)]">
          {hotel_reservation.hotel?.name || 'Loading...'}
        </span>
        <span className="font-medium text-lg text-[var(--primary)]">
          {hotel_reservation.hotel?.location || 'Loading...'}
        </span>
      </div>
      <div className="w-full flex flex-col items-center justify-between">
        <div className="flex w-full flex-col items-start justify-between">
          <span className="text-lg font-semibold text-black">Check-in:</span>
          <div className="flex items-center gap-1">
            <span className="font-medium flex flex-col text-lg text-[var(--primary)]">
              <p className="font-semibold"><span className="font-light text-lg">{formatDate(hotel_reservation.check_in)}</span></p>
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-start justify-between">
          <span className="text-lg font-semibold text-black">Check-out:</span>
          <div className="flex items-center gap-1">
            <span className="font-medium flex flex-col text-lg text-[var(--primary)]">
              <p className="font-semibold"><span className="font-light text-lg">{formatDate(hotel_reservation.check_out)}</span></p>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col px-4 gap-2 items-center justify-between">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-lg font-semibold text-black">Rooms:</span>
          <span className="font-medium text-left text-lg text-[var(--primary)]">
            {hotel_reservation.rooms}
          </span>
        </div>

        <div className="flex w-full items-center gap-2 justify-between">
          <span className="text-lg font-semibold text-black">Price:</span>
          <span className="font-medium text-left text-lg text-[var(--primary)]">
            ${hotel_reservation.total_price}
          </span>
        </div>
        <div className="flex flex w-full items-center justify-between">
          <span className="text-lg font-semibold text-black">Status:</span>
          <span className="font-medium text-lg text-[var(--secondary)]">
            {status}
          </span>
        </div>
      </div>

     
      <div className="flex h-full items-center justify-center">
        <button
          className="w-fit rounded-xl font-semibold px-6 py-4 text-xl bg-[var(--secondary)] text-[var(--bg-color)]"
          onClick={(e) => confirmReservation(id, true)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

const HistorySection = ({ data, loading, error, isHotel }) => {
  const router = useRouter();
  const [tripData, setTripData] = useState({});

  const fetchDetails = async (tripId) => {
    if (!tripId) return null;
    try {
      const response = await fetch(`${API_URL}/trip_details/${tripId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  };

  const fetchDeparture = async (tripId, departureId) => {
    const details = await fetchDetails(tripId);
    return details?.departure_places?.find(el => el.id === departureId);
  };

  const fetchHotelDetails = async (id) => {
    if (!id) return null;
    try {
      const response = await fetch(`${API_URL}/hotel_details/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  };

  const confirmReservation = async (id, isHotel) => {
    const url = isHotel
      ? `${API_URL}/reservation/confirm_hotel_reservation_manually/${id}/`
      : `${API_URL}/reservation/confirm_trip_reservation_manually/${id}/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to confirm reservation");
      }

      const result = await response.json();
      alert(result.success || "Reservation confirmed successfully");
      router.refresh();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!data) return;

      const newData = {};
      for (const item of data) {
        try {
          if (isHotel) {
            const hotel = await fetchHotelDetails(item.hotel);
            newData[item.id] = {
              ...item,
              hotel_reservation: {
                ...item,
                hotel: hotel || { id: item.hotel, name: 'Loading...', location: 'Loading...' }
              }
            };
          } else {
            const details = await fetchDetails(item.trip);
            const departure = await fetchDeparture(item.trip, item.departure_trip);
            newData[item.id] = {
              ...item,
              trip_title: details?.title || 'N/A',
              departure_location: departure?.location || 'N/A'
            };
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          newData[item.id] = {
            ...item,
            trip_title: 'Error',
            departure_location: 'Error',
            hotel_reservation: {
              ...item,
              hotel: { id: item.hotel, name: 'Error', location: 'Error' }
            }
          };
        }
      }
      setTripData(newData);
    };

    fetchAllData();
  }, [data, isHotel]);

  if (loading) return <div className="text-center py-10">Loading history...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading history: {error}</div>;
  if (!data || data.length === 0) return (
    <div className="text-center text-xl py-10 bg-[var(--bg-color)] rounded-xl">
      No reservations found
    </div>
  );

  return (
    <div className="w-full p-4 rounded-xl bg-[var(--bg-color)] flex flex-col gap-4">
      {data.map((item) => {
        const itemData = tripData[item.id] || item;
        return isHotel ? (
          <HistoryBoxStay
            key={item.id}
            id={item.id}
            hotel_reservation={itemData.hotel_reservation || {
              ...item,
              hotel: { id: item.hotel, name: 'Loading...', location: 'Loading...' }
            }}
            status={item.status}
            confirmReservation={confirmReservation}
          />
        ) : (
          <HistoryBoxFlight
            key={item.id}
            id={item.id}
            departure_location={itemData.departure_location}
            status={item.status}
            tickets={item.tickets}
            total_price={item.total_price}
            trip_title={itemData.trip_title}
            date={item.date} 
            confirmReservation={confirmReservation}

          />
        );
      })}
    </div>
  );
};

export default function Reservation() {
  const [choice, setChoice] = useState("Flights");
  const [flights, setFlights] = useState([]);
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHM, setIsHM] = useState(false)
  useEffect(() => {
    const fetchReservations = async () => {
      console.log(localStorage.getItem("accessToken"))
      try {
        setLoading(true);
        setError(null);
        const responseP = await getMyProfile();
        const isHotelManager = responseP.profile.department === 'hotel_manager' || responseP?.profile?.department
          === 'owner'
        console.log(isHotelManager)
        setIsHM(isHotelManager)
        const secondUrl = isHotelManager ? `${API_URL}/reservation/view_hotel_reservations/` : `${API_URL}/reservation/view_trip_reservations/`
        const [flightsRes, staysRes] = await Promise.all([
          fetch(`${API_URL}/reservation/view_trip_reservations/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }),



          fetch(secondUrl, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          })
        ]);

        if (!flightsRes.ok || !staysRes.ok) {
          throw new ('Failed to fetch reservations');
        }

        const flightsData = await flightsRes.json();
        const staysData = await staysRes.json();

        // Combine both types of reservations for each category
        setFlights([
          ...(flightsData.with_hotel_reservation || []),
          ...(flightsData.without_hotel_reservation || [])
        ]);
        if (isHotelManager) {
          setStays([
            ...(staysData.with_trip || []),
            ...(staysData.without_trip || [])
          ]);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="w-full py-0 px-0 flex flex-col gap-2">
      {isHM && (<div className="flex flex-row rounded-t-xl justify-between items-center rounded- gap-4 mb-0 bg-[var(--bg-color)]">
        <button
          className={`w-[80%] p-4 rounded-t-[10px] flex h-fit py-5 justify-start items-center gap-2 cursor-pointer ${choice === "Flights"
            && isHM ? "shadow-[inset_0_-6px_0_var(--primary)] text-[var(--primary)]"
            : "text-gray-500"
            }`}
          onClick={() => setChoice("Flights")}
        >
          {flightIcon} Flights
        </button>
        {isHM && (<button
          className={`flex p-4 h-full w-[80%] py-5 justify-start items-center gap-2 cursor-pointer ${choice === "Stays"
            ? "shadow-[inset_0_-6px_0_var(--primary)] text-[var(--primary)]"
            : "text-gray-500"
            }`}
          onClick={() => setChoice("Stays")}
        >
          {staysIcon} Stays
        </button>
        )}</div>
      )}
      <HistorySection
        data={choice === 'Flights' ? flights : stays}
        loading={loading}
        error={error}
        isHotel={choice === 'Stays'}
      />
    </div>
  );
}