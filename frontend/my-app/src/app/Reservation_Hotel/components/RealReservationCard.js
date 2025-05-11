"use client"

import InputLogin from "@/app/components/inputLogin"
import { API_URL } from "@/app/utils/constants"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { GrLocationPin } from "react-icons/gr"

const HotelReservationCard = ({ setClicked, hotel_data }) => {
    const [rooms, setRooms] = useState(1)
    const [guests, setGuests] = useState(1)
    const [checkIn, setCheckIn] = useState("")
    const [checkOut, setCheckOut] = useState("")
    const [totalPrice, setTotalPrice] = useState(0)
    const [totalNights, setTotalNights] = useState(0)
    const [loading, setLoading] = useState(false)
    const [priceLoading, setPriceLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchPrice = async () => {
            if (!checkIn || !checkOut || !rooms) return

            try {
                setPriceLoading(true)

                // Validate dates
                if (new Date(checkIn) >= new Date(checkOut)) {
                    throw new Error("Check-in date must be before check-out date")
                }

                const params = new URLSearchParams({
                    check_in: checkIn,
                    check_out: checkOut,
                    rooms: rooms
                }).toString()

                const response = await fetch(
                    `${API_URL}/reservation/get_hotel_reservation_price/${hotel_data.id}/?${params}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    }
                )

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to get price')
                }

                const data = await response.json()
                setTotalPrice(data.total_price)
                setTotalNights(data.total_nights)
            } catch (err) {
                console.error("Price calculation error:", err)
                // You might want to show this error to the user
                setTotalPrice(0)
                setTotalNights(0)
            } finally {
                setPriceLoading(false)
            }
        }
        const timer = setTimeout(() => {
            fetchPrice()
        }, 500)

        return () => clearTimeout(timer)
    }, [checkIn, checkOut, rooms, hotel_data.id])

    const handleInitReservation = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)

            if (!checkIn || !checkOut) {
                throw new Error("Please select check-in and check-out dates")
            }

            if (rooms > (hotel_data.total_rooms - hotel_data.total_occupied_rooms)) {
                throw new Error(`Only ${hotel_data.total_rooms - hotel_data.total_occupied_rooms} rooms available`)
            }

            const payload = {
                check_in: checkIn,
                check_out: checkOut,
                rooms: rooms,
                guests: guests,
                total_price: totalPrice
            }
            console.log(
                `${API_URL}/reservation/initiate_hotel_reservation/${hotel_data.id}/`)
            console.log(localStorage.getItem('accessToken'))
            console.log(JSON.stringify(payload))
            const response = await fetch(
                `${API_URL}/reservation/initiate_hotel_reservation/${hotel_data.id}/`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            )

            if (!response.ok) {
                const errors = await response.json()
                throw new Error(errors.errors || 'Reservation failed')
            }

            const data = await response.json()
            alert('Reservation made successfully')
            setClicked(false)
            router.push('/Hotels')
        } catch (err) {
            console.error("Reservation error:", err)
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleInitReservation}
            className="min-w-[400px] absolute top-1/4 left-1/3 z-10 mx-auto p-6 bg-[var(--bg-color)] rounded-xl shadow-2xl">

            <div className="w-full pb-4 text-2xl font-semibold text-[var(--primary)]">
                <h1 className="w-full flex justify-between items-center">
                    {hotel_data.name}
                    <span className="cursor-pointer" onClick={() => setClicked(false)}>{"x"}</span>
                </h1>
                <div className="w-full flex justify-start gap-4 text-xl font-medium text-[var(--primary)]">
                    <h1 className="text-xl text-[var(--secondary)] flex items-center">
                        <GrLocationPin className="mr-1" />
                        {hotel_data.location}
                    </h1>
                </div>
            </div>

            <div className="w-full pb-2 text-lg gap-1 font-medium text-[var(--primary)]">
                Price per night: <span className="font-semibold">${hotel_data.price_per_night}</span>
            </div>

            <div className="w-full pb-2 text-lg gap-1 font-medium text-[var(--primary)]">
                Available rooms: <span className="font-semibold">
                    {hotel_data.total_rooms - hotel_data.total_occupied_rooms}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="relative">
                        <InputLogin
                            type="date"
                            min={format(new Date(), 'yyyy-MM-dd')}
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="p-2 w-full border rounded-lg"
                            required
                        />
                    </div>
                </div>
                <div>
                    <div className="relative">
                        <InputLogin
                            type="date"
                            min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="p-2 w-full border rounded-lg"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <InputLogin
                        type="number"
                        name="rooms"
                        value={rooms}
                        onChange={(e) => setRooms(parseInt(e.target.value))}
                        min={1}
                        max={hotel_data.total_rooms - hotel_data.total_occupied_rooms}
                        placeholder="Number of rooms"
                    />
                </div>
                <div>
                    <InputLogin
                        type="number"
                        name="guests"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        min={0}
                        placeholder="Number of guests"
                    />
                </div>
            </div>

            <div className="w-full py-4 text-lg gap-1 text-[var(--primary)] flex items-center">
                <p>Total price: </p>
                <h1 className="font-semibold text-[var(--secondary)]">${totalPrice}</h1>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="p-4 w-full bg-[var(--primary)] text-[var(--bg-color)] rounded-xl hover:bg-[var(--secondary)] disabled:opacity-50"
            >
                {loading ? "Processing..." : "Book Now"}
            </button>
        </form>
    )
}

export default HotelReservationCard