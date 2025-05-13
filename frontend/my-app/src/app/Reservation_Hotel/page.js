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
    rooms,
    setRooms,
    nights,
    setNights,
    data,
    selectedPayment,
    setSelectedPayment,
    selectedStay,
    setClicked,
    handleInitReservation
}) => {
    if (!data) return null;

    return (
        <div className="w-full flex flex-col justify-center gap-6 items-center rounded-xl my-20 mx-auto">
            <div className="w-full py-6 flex flex-col justify-start items-center rounded-xl bg-[var(--bg-color)] gap-6">
                {selectedStay ? (
                    <>
                        <div className="w-full px-6 flex justify-between items-center">
                            <h1 className="w-fit text-2xl font-bold">{data.name}</h1>
                            <h1 className="w-fit text-4xl text-[var(--secondary)] font-extrabold">
                                ${data.price_per_night}
                            </h1>
                        </div>

                    </>
                ) : (
                    <p className="text-gray-500">No Stay selected</p>
                )}
            </div>

            <div className="w-full px-6 py-4 flex flex-col justify-start items-center rounded-xl bg-[var(--bg-color)] gap-4">

                <PaymentOption
                    id="pay-half"
                    selected={selectedPayment === 'pay-half'}
                    onSelect={() => setSelectedPayment("pay-half")}
                    name="Actual payment through Baridi-Mob"
                    location="Pay by baridi mob and send us the payment confirmation"
                />

                <PaymentOption
                    id="pay-full"
                    selected={selectedPayment === 'pay-full'}
                    onSelect={() => setSelectedPayment("pay-full")}
                    name="Simulate payment"
                    location="simulate a card payment"
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

const PaymentOption = ({ id, selected, onSelect, name, location }) => (
    <label
        htmlFor={id}
        className={`flex p-4 rounded-xl w-full justify-between items-center cursor-pointer ${selected ? 'bg-[var(--primary)] text-[var(--bg-color)]' : ''
            }`}
        onClick={onSelect}
    >
        <div className="w-full flex flex-col justify-center items-start">
            <h1 className="text-xl font-semibold">{name}</h1>
            <p>{location}</p>
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


import RealCard from "./components/RealReservationCard"
import HotelReservationCard from "./components/RealReservationCard";

export default function TripDetail() {
    const [stayDetails, setStayDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState("pay-half");
    const [error, setError] = useState(null);
    const [details, setDetails] = useState(null);
    const [clicked, setClicked] = useState(false);
    const [nights, setNights] = useState(1);
    const [rooms, setRooms] = useState(1);



    useEffect(() => {
        const staySelected = localStorage.getItem("selectedStay");
        if (!staySelected) {
            setError("No stay selected");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch(`${API_URL}/hotel_details/${staySelected}`)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                console.log(data)
                setStayDetails(data)
            } catch (err) {
                console.error("Fetch error:", err)
                setError(err.message)
            } finally {
                setLoading(false)
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
    const staySelected = localStorage.getItem("selectedStay");


    return (
        <div className="w-full relative py-4 bg-[var(--bg)]">
            <NavBar />

            {clicked && selectedPayment === "pay-full" && (
                <CardInformation setClicked={setClicked} />
            )}
            {
                clicked && selectedPayment === "pay-half" && (
                    <HotelReservationCard
                        setClicked={setClicked}
                        hotel_data={stayDetails}
                    />)}

            <div className="w-[80%] min-h-[80vh] flex flex-col sm:flex-row items-start gap-8 justify-between mx-auto">
                {stayDetails ? (
                    <>
                        <FirstSec
                            selectedPayment={selectedPayment}
                            setSelectedPayment={setSelectedPayment}
                            data={stayDetails}
                            rooms={rooms}
                            setRooms={setRooms}
                            nights={nights}
                            setNights={setNights}
                            setClicked={setClicked}
                            selectedStay={staySelected}
                        />
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