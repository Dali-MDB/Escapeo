'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { GrLocationPin } from "react-icons/gr";
import { IoLocationOutline } from "react-icons/io5";
import { Heart, Star, Share2, Locate, Columns4Icon } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import HistoryBox from "../Setting/components/HistoryBox";
import { API_URL } from "../utils/constants";
import Image from "next/image";
const bg = "/bg.png";
import CardInformation from "./components/CardInformation";
import Card from "./components/card";


const FirstSec = ({tickets , setTickets, data, selectedDeparture, setClicked, handleInitReservation }) => {
    const [selectedPayment, setSelectedPayment] = useState('pay-full');

    if (!data || !data.departure_places) return null;

    return (
        <div className="w-full flex flex-col justify-center gap-6 items-center rounded-xl my-20 mx-auto">
            <div className="w-full py-6 flex flex-col justify-start items-center rounded-xl bg-[var(--bg-color)] gap-6">
                {selectedDeparture ? (
                    <>
                        <div className="w-full px-6 flex justify-between items-center">
                            <h1 className="w-fit text-2xl font-bold">{data.title}</h1>
                            <h1 className="w-fit text-4xl text-[var(--secondary)] font-extrabold">${selectedDeparture.price}</h1>
                        </div>
                        <div className="w-full px-10 py-0 flex justify-between items-center">
                            <p>{data.departure_date.slice(0, 10)}</p>
                            <p>{data.departure_date.slice(11, 19)}</p>
                        </div>

                        <div className="w-[80%] px-6 py-1 flex justify-around items-center border">
                            <div className="py-6 text-2xl">
                                <p>{selectedDeparture.location}</p>
                            </div>
                            <div className="py-6">
                                <Image alt="seperator" width={100} height={100} src={"/iconSep.png"} />
                            </div>
                            <div className="py-6 text-2xl">
                                <p>{data.destination}</p>
                            </div>
                        </div>

                        <div className="w-[80%] px-6 py-1 flex justify-around items-center border">
                            <input type="number" value={tickets} placeholder="Number of tickets" onChange={(e)=>{
                                setTickets(e.target.value)
                            }} className="w-full px-6 text--xl py-2"/>
                        </div>

                    </>
                ) : (
                    <p className="text-gray-500">No departure selected</p>
                )}
            </div>

            <div className="w-full px-6 py-4 flex flex-col justify-start items-center rounded-xl bg-[var(--bg-color)] gap-4">
                <label
                    htmlFor="pay-full"
                    className={`flex p-4 rounded-xl w-full justify-between items-center cursor-pointer ${selectedPayment === 'pay-full' ? 'bg-[var(--primary)] text-[var(--bg-color)]' : ''}`}
                    onClick={() => setSelectedPayment('pay-full')}
                >
                    <div className="w-full flex flex-col justify-center items-start">
                        <h1 className="text-xl cont-semibold">Pay in full</h1>
                        <p>Pay the total and you are all set</p>
                    </div>
                    <input
                        type="radio"
                        id="pay-full"
                        name="payment"
                        checked={selectedPayment === 'pay-full'}
                        onChange={() => setSelectedPayment('pay-full')}
                        className="hidden"
                    />
                </label>

                <label
                    htmlFor="pay-half"
                    className={`flex p-4 rounded-xl w-full justify-between items-center cursor-pointer ${selectedPayment === 'pay-half' ? 'bg-[var(--primary)] text-[var(--bg-color)]' : ''}`}
                    onClick={() => setSelectedPayment('pay-half')}
                >
                    <div className="w-full flex flex-col justify-center items-start">
                        <h1 className="text-xl cont-semibold">Pay part now, part later</h1>
                        <p>Pay half the price now, and the rest will be automatically charged to the same payment method 15 days from now. No extra fees.</p>
                    </div>
                    <input
                        type="radio"
                        id="pay-half"
                        name="payment"
                        checked={selectedPayment === 'pay-half'}
                        onChange={() => setSelectedPayment('pay-half')}
                        className="hidden"
                    />
                </label>
            </div>
            <div className="w-full px-0 py-4 flex flex-col justify-start items-end rounded-xl  gap-4">
                <div className="relative rounded-xl  h-full   border-[var(--secondary)] text-[var(--secondary)]" onClick={() => {
                    setClicked(prev => !prev)
                }}>
                    <Card  />
                </div>
            </div>
        </div>
    );
};


const DepartureBox = ({ location, destination, capacity, price_category, price, index, length }) => (
    <div className={`w-1/2 py-6 px-0 border-[var(--primary)] ${index !== length - 1 && "border-b-[0.5px]"} flex justify-between items-center`}>
        <div className="w-full flex justify-start items-center gap-8">
            <p className="text-xl flex items-center gap-2">
                <GrLocationPin size={20} />
                <span className="font-bold">{location} - {destination}</span>
            </p>
            <p className="text-xl font-bold">Capacity: <span className="font-medium">{capacity}</span></p>
            <p className="text-xl font-bold">Class: <span className="font-medium">{price_category}</span></p>
        </div>
        <div className="flex w-1/4 justify-end">
            <div className="w-fit px-8 py-2 text-xl text-[var(--primary)] font-semibold rounded-xl">$ {price}</div>
            <Link href="/Reservation" className="w-fit px-8 py-2 text-xl font-semibold bg-[var(--secondary)] rounded-xl">Book</Link>
        </div>
    </div>
);

const SecondSec = ({ data }) => {
    if (!data) return null;

    return (
        <div className="relative h-full min-h-[20vh] w-1/2 rounded-xl flex flex-col gap-14 justify-start my-20 py-6 items-center bg-[var(--bg-color)] mx-auto px-6">
            {
                data.details ?
                    <p className="text-xl font-semibold w-3/4">{data.details}</p>
                    : <>
                    </>
            }</div>
    );
};

export default function TripDetail() {
    const [tripDetails, setTripDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDeparture, setSelectedDeparture] = useState(null);
    const [error, setError] = useState(null);
    const [details, setDetails] = useState(null);
    const [clicked, setClicked] = useState(false)
    const [tickets , setTickets] = useState(1);


    const handleInitReservation = async () => {
        try{
            setLoading(true)
        const payLoad = {
            departure_trip_id:localStorage.getItem('departureId'),
            tickets:tickets,
            total_price:Number(selectedDeparture.price)*tickets 
        }
        console.log(localStorage.getItem('accessToken'))
        console.log(JSON.stringify(payLoad))
        console.log(`${API_URL}/reservation/initiate_trip_reservation/${localStorage.getItem("tripSelected")}/`)
        const response = await fetch(`${API_URL}/reservation/initiate_trip_reservation/${localStorage.getItem("tripSelected")}/`, {

            method: 'POST'
            , headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                "content-type": "application/json"
            },
            body:JSON.stringify(payLoad)

        })
        if(response.ok){

            alert('Reservation made')
            setClicked(false)
        }else{
            const errors = await response.json()
            throw new Error(errors.errors)
        }
}catch(err){
    alert(err)
}finally{
    setLoading(false)
}
    }

    useEffect(() => {
        const tripSelected = localStorage.getItem("tripSelected");
        const storedDepartureId = localStorage.getItem("departureId");


        const fetchDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/trip_details/${tripSelected}`);
                const data = await response.json();


                // Try both string and number comparison
                const foundDeparture = data.departure_places?.find(el =>
                    el.id == storedDepartureId || // loose equality
                    el.id === Number(storedDepartureId) // strict with conversion
                );

                setSelectedDeparture(foundDeparture);
                setTripDetails(data);

            } catch (err) {
                console.error("Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        const fetchNearbyHotels = async () => {
            try {
                const response = await fetch(`${API_URL}/reservation/get_nearby_hotels/${tripSelected}/`)
                if (response.ok) {
                    const data = await response.json()
                    console.log(data)
                    setDetails(data)
                }
            } catch (err) {
                alert('Error: ' + err)
            }
        }
        if (tripSelected) {
            fetchDetails();
            fetchNearbyHotels()
        }
    }, []);

    if (loading) return (
        <div className="w-full min-h-screen bg-[var(--bg)] flex justify-center items-center">
            <NavBar />
            <div className="mt-20">Loading trip details...</div>
        </div>
    );

    if (error) return (
        <div className="w-full  bg-[var(--bg)]">
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
        <div className="w-full relative  py-4 bg-[var(--bg)]">
            <NavBar />
            {clicked && <CardInformation handleInitReservation={handleInitReservation} />}

            {tripDetails ? (
                <div className="w-[80%] min-h-[80vh] flex items-start gap-8 justify-between mx-auto">

                    <FirstSec data={tripDetails} tickets={tickets} setTickets={setTickets} selectedDeparture={selectedDeparture} setClicked={setClicked} handleInitReservation={handleInitReservation} />
                    <SecondSec data={details} />
                </div>
            ) : (
                <div className="text-center mt-20">
                    No trip selected or no details available
                </div>
            )}
            <Footer />
        </div>
    );
}