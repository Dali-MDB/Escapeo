'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { GrLocationPin } from "react-icons/gr";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CardInformation from "./components/CardInformation";
import Card from "./components/card";
import { API_URL } from "../utils/constants";
import Image from "next/image";

const FirstSec = ({
    tickets,
    selectedPayment,
    setSelectedPayment,
    setTickets,
    data,
    selectedDeparture,
    setClicked,
    handleInitReservation
}) => {
    if (!data || !data.departure_places) return null;

    return (
        <div className="w-full flex flex-col justify-center gap-6 items-center rounded-xl my-20 mx-auto">
            <div className="w-full py-6 flex flex-col justify-start items-center rounded-xl bg-[var(--bg-color)] gap-6">
                {selectedDeparture ? (
                    <>
                        <div className="w-full px-6 flex justify-between items-center">
                            <h1 className="w-fit text-2xl font-bold">{data.title}</h1>
                            <h1 className="w-fit text-4xl text-[var(--secondary)] font-extrabold">
                                ${selectedDeparture.price}
                            </h1>
                        </div>
                        <div className="w-full px-10 py-0 flex justify-between items-center">
                            <p>{new Date(data.departure_date).toLocaleDateString()}</p>
                            <p>{new Date(data.departure_date).toLocaleTimeString()}</p>
                        </div>

                        <div className="w-[80%] px-6 py-1 flex justify-around items-center border">
                            <div className="py-6 text-2xl">
                                <p>{selectedDeparture.location}</p>
                            </div>
                            <div className="py-6">
                                <Image
                                    alt="separator"
                                    width={100}
                                    height={100}
                                    src="/iconSep.png"
                                />
                            </div>
                            <div className="py-6 text-2xl">
                                <p>{data.destination}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">No departure selected</p>
                )}
            </div>

            <div className="w-full px-6 py-4 flex flex-col justify-start items-center rounded-xl bg-[var(--bg-color)] gap-4">

                <PaymentOption
                    id="pay-half"
                    selected={selectedPayment === 'pay-half'}
                    onSelect={() => setSelectedPayment("pay-half")}
                    title="Actual payment through Baridi-Mob"
                    description="Pay by baridi mob and send us the payment confirmation"
                />

                <PaymentOption
                    id="pay-full"
                    selected={selectedPayment === 'pay-full'}
                    onSelect={() => setSelectedPayment("pay-full")}
                    title="Simulate payment"
                    description="simulate a card payment"
                />


            </div>

            <div className="w-full px-0 py-4 flex flex-col justify-start items-end rounded-xl gap-4">
                <div className="relative rounded-xl h-full border-[var(--secondary)] text-[var(--secondary)]">
                    <Card
                        selectedPayment={selectedPayment}
                        setClicked={setClicked}
                    />
                </div>
            </div>
        </div>
    );
};

const PaymentOption = ({ id, selected, onSelect, title, description }) => (
    <label
        htmlFor={id}
        className={`flex p-4 rounded-xl w-full justify-between items-center cursor-pointer ${selected ? 'bg-[var(--primary)] text-[var(--bg-color)]' : ''
            }`}
        onClick={onSelect}
    >
        <div className="w-full flex flex-col justify-center items-start">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p>{description}</p>
        </div>
        <input
            type="radio"
            id={id}
            name="payment"
            checked={selected}
            onChange={onSelect}
            className="hidden"
        />
    </label>
);

const SecondSec = ({ data }) => {
    if (!data) return null;

    return (
        <div className="relative h-full min-h-[20vh] w-full rounded-xl flex flex-col gap-14 justify-start my-20 py-6 items-center bg-[var(--bg-color)] mx-auto px-6">
            {data.details && (
                <p className="text-xl font-semibold w-3/4">{data.details}</p>
            )}
        </div>
    );
};

import RealCard from "./components/RealReservationCard" 

export default function TripDetail() {
    const [tripDetails, setTripDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDeparture, setSelectedDeparture] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState("pay-half");
    const [error, setError] = useState(null);
    const [details, setDetails] = useState(null);
    const [clicked, setClicked] = useState(false);
    const [tickets, setTickets] = useState(1);

   

    useEffect(() => {
        const tripSelected = localStorage.getItem("tripSelected");
        if (!tripSelected) {
            setError("No trip selected");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [tripResponse, hotelsResponse] = await Promise.all([
                    fetch(`${API_URL}/trip_details/${tripSelected}`),
                    fetch(`${API_URL}/reservation/get_nearby_hotels/${tripSelected}/`)
                ]);

                if (!tripResponse.ok) throw new Error("Failed to fetch trip details");
                if (!hotelsResponse.ok) throw new Error("Failed to fetch hotels");

                const tripData = await tripResponse.json();
                const hotelsData = await hotelsResponse.json();

                const storedDepartureId = localStorage.getItem("departureId");
                const foundDeparture = tripData.departure_places?.find(
                    el => el.id == storedDepartureId
                );

                setTripDetails(tripData);
                setSelectedDeparture(foundDeparture);
                setDetails(hotelsData);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="w-full min-h-screen bg-[var(--bg)] flex justify-center items-center">
            <NavBar />
            <div className="mt-20">Loading trip details...</div>
        </div>
    );

    if (error) return (
        <div className="w-full bg-[var(--bg)]">
            <NavBar />
            <div className="mt-20 text-center text-red-500">
                Error: {error}
                <button
                    onClick={() => window.location.reload()}
                    className="ml-4 px-4 py-2 bg-[#F38B1E] rounded text-white"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full relative py-4 bg-[var(--bg)]">
            <NavBar />

            {clicked && selectedPayment === "pay-full" && (
                <CardInformation setClicked={setClicked}  />
            )}
            {
            clicked && selectedPayment === "pay-half" && (
                <RealCard setClicked={setClicked} departure_data={selectedDeparture} trip_data={tripDetails}  />
            )}

            <div className="w-[80%] min-h-[80vh] flex items-start gap-8 justify-between mx-auto">
                {tripDetails ? (
                    <>
                        <FirstSec
                            selectedPayment={selectedPayment}
                            setSelectedPayment={setSelectedPayment}
                            data={tripDetails}
                            tickets={tickets}
                            setTickets={setTickets}
                            selectedDeparture={selectedDeparture}
                            setClicked={setClicked}
                            
                        />
                        <SecondSec data={details} />
                    </>
                ) : (
                    <div className="text-center mt-20 w-full">
                        No trip details available
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}