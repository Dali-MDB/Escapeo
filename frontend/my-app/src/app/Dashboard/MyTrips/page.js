'use client'
import FlightBox from "@/app/components/FlightBox"
import { getMyProfile } from "@/app/utils/auth"
import { API_URL } from "@/app/utils/constants"
import { useState, useEffect } from "react"

export default function MyTrips() {
    const [trips, setTrips] = useState(null)
    const [isHm, setIsHm] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const isHotelManager = (profile) => {
        return profile?.profile?.department === 'hotel_manager' ||
            profile?.profile?.department === 'owner'
    }

    const fetchTrips = async (profileId) => {
        console.log(`${localStorage.getItem('accessToken')}`)
        try {
            const response = await fetch(`${API_URL}/profiles/get_my_managed_trips/`, {


                method: "GET",

                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to fetch trips.")
            }

            const data = await response.json()
            console.log(data)
            setTrips(data)
        } catch (err) {
            setError(err.message || "Failed to fetch trips")
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        const initialFetch = async () => {
            try {
                setLoading(true)

                fetchTrips()

            } catch (err) {
                setError(err.message || "Initialization failed")
            } finally {
                setLoading(false)
            }
        }

        initialFetch()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    if (!trips) return <div>No trips found</div>

    /**
     * coming_trips
: 
Array(2)
0
: 
{id: 35, title: 'A romantic trip to Paris', description: '“Experience the magic of Paris with a romantic get…g for unforgettable moments with your loved one.”', capacity: 1, guide: null, …}
1
: 
{id: 36, title: 'Alger', description: 'discover the hidden places in Algiers', capacity: 1, guide: null, …}
length
: 
2
[[Prototype]]
: 
Array(0)
done_trips
: 
[]
ongoing_trips
: 
[]
     */


    const handleDelete = async (id) => {

        alert('Are you sure you want to delete this trip ?')
        try {
            const response = await fetch(`${API_URL}/trip_details/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }

            })
            if (response.ok) {
                const data = await response.json()

            }

        } catch (err) {
        } finally {
            fetchTrips()
        }
    }

    return (
        <div className="w-full min-h-[40vh] bg-[var(--bg-color)] p-4 rounded-xl text-black grid grid-cols-4 gap-2">

            <h1 className="text-2xl text-[var(--primary)] font-bold col-span-full">Added trips</h1>
            {trips.coming_trips.length > 0 && <h3 className="text-lg col-span-full">Comming</h3>
            }
            {trips.coming_trips.map(trip => (
                <div key={trip.id} className="p-4 relative rounded">
                    <FlightBox
                        key={trip.id}
                        link={"/Dashboard/MyTrips/modify_trip"}
                        backgroundImage={trip?.images[0]?.image}
                        title={trip.title}
                        description={trip.description}
                        price={trip.departure_places[0]?.price}
                        id={trip.id}
                        isAdmin={true}
                        handledelete={handleDelete}
                    />
                    {/* Add more trip details here */}
                </div>
            ))}

            {trips.done_trips.length > 0 &&
                <h3 className="text-lg col-span-full">Done</h3>
            }
            {trips.done_trips.length > 0 &&

                trips.done_trips.map(trip => (
                    <div key={trip.id} className="p-4 border rounded">
                        <FlightBox
                            key={trip.id}
                            link={"/TripDetail"}
                            backgroundImage={trip?.images[0]?.image}
                            title={trip.title}
                            description={trip.description}
                            price={trip.departure_places[0]?.price}
                            id={trip.id}
                        />
                        {/* Add more trip details here */}
                    </div>
                ))}

            {trips.ongoing_trips.length > 0 &&
                <h3 className="text-lg col-span-full">On going</h3>
            }

            {trips.ongoing_trips.length > 0 && trips.ongoing_trips.map(trip => (
                <div key={trip.id} className="p-4 border rounded">
                    <FlightBox
                        key={trip.id}
                        link={"/TripDetail"}
                        backgroundImage={trip?.images[0]?.image}
                        title={trip.title}
                        description={trip.description}
                        price={trip.departure_places[0]?.price}
                        id={trip.id}
                    />
                    {/* Add more trip details here */}
                </div>
            ))}


        </div>
    )
}