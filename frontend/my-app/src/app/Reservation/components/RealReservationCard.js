"use client"

import InputLogin from "@/app/Dashboard/Components/InputLogin"
import { API_URL } from "@/app/utils/constants"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TripDetail from "../page"



/**
 * 
 * 
 * trip = get_object_or_404(Trip, id=trip_id)
    
departure_trip = get_object_or_404(DepartureTrip, trip=trip, id=request.GET.get("departure_trip_id"))
    
tickets = int(request.GET.get("tickets", 1))
    
 */
const RealCard = ({ setClicked,departure_data, trip_data }) => {
    const [number_of_tickets, setNumber_of_tickets] = useState(1)
    const [total_price, setTotalPrice] = useState(null)
    useEffect(() => {
        const tripSelected = localStorage.getItem("tripSelected");
        const storedDepartureId = localStorage.getItem("departureId");
        console.log(trip_data)

        console.log(departure_data)

        const getRealPrice = async () => {
            console.log(localStorage.getItem('accessToken'))
            console.log(JSON.stringify({
                departure_trip_id: storedDepartureId,
                tickets: number_of_tickets
            }))
            const response = await fetch(`${API_URL}/reservation/get_trip_reservation_price/${tripSelected}/${storedDepartureId}/${number_of_tickets}/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    , "content-type": "application/json"
                }
            })
            if (response.ok) {
                const data = await response.json()
                setTotalPrice(data.total_trip_price)

            }
        }
        getRealPrice()

    }, [number_of_tickets])
    const [loading , setLoading] = useState(false)


    const handleInitReservation = async () => {
        try {
            setLoading(true);
            const payload = {
                departure_trip_id: departure_data.id,
                tickets: number_of_tickets,
                total_price: total_price
            };

            const response = await fetch(
                `${API_URL}/reservation/initiate_trip_reservation/${trip_data.id}/`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errors = await response.json();
                throw new Error(errors.errors || 'Reservation failed');
            }

            alert('Reservation made successfully');

            setClicked(false);
            const router = useRouter()
            router.push('/Flights')
        } catch (err) {
            console.error("Reservation error:", err);
            alert(err.message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={(e)=>{
            e.preventDefault()
            handleInitReservation()
        }} className="min-w-[400px]  absolute top-1/4 left-1/3 z-10 mx-auto p-6 bg-white rounded-xl shadow-2xl rounded-xl">


            <div className="w-full pb-4 text-2xl font-semibold text-[var(--primary)]">
                <h1 className="w-full flex justify-between items-center">{trip_data.title} <span className="cursor-pointer" onClick={(e)=>{
                    setClicked(false)
                }}>{"x"}</span></h1>
                <div className="w-full flex justify-start gap-4 text-xl font-medium text-[var(--primary)]">
                    <h1 className="text-xl text-[var(--secondary)]">{departure_data.location}</h1>
                    <h1 className="font-extrabold">-</h1>
                    <h1 className="text-xl text-[var(--secondary)]">{trip_data.destination}</h1>
                </div>
            </div>
            <div className="w-full flex pb-2 text-lg gap-1 font-medium text-[var(--primary)]">
                Capacity:<h1 className="font-semibold">{departure_data.capacity - departure_data.sold_tickets}</h1>
            </div>

            <div className="w-full pb-6 gap-1 text-lg flex font-medium text-[var(--primary)]">
                Ticket price: <h1 className="font-semibold">{departure_data.price}</h1>
            </div>

            <InputLogin
                type={"number"} name={"number_of_tickets"} value={number_of_tickets} onChange={(e) => {
                    setNumber_of_tickets(e.target.value)
                }} max={departure_data.capacity - departure_data.sold_tickets} placeholder={"Number of tickets"}
            />
            <div className="w-full py-4 text-lg gap-1 text-[var(--primary)] flex items-center">
                <p>Total price: </p><h1 className="font-semibold text-[var(--secondary)]">{total_price}</h1>
            </div>
            <button
            type="submit"
                className="p-4 w-full bg-[var(--primary)] text-[var(--bg-color)] rounded-xl"
                >
                Submit
            </button>
        </form>
    )
}


export default RealCard