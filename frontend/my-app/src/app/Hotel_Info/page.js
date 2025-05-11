'use client'
import { useForm } from "../context/FormContext"
import { API_URL } from "../utils/constants"
import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import Image from "next/image"
import { Heart, Star } from "lucide-react"
import HistoryBox from "../Setting/components/HistoryBox"
const bg = "/bg.png"; // Ensure this path is correct
import { IoLocationOutline } from "react-icons/io5";
import Link from "next/link"
import { Share2 } from "lucide-react"
import { Locate } from "lucide-react"
import Footer from "../components/Footer"
import { GrLocationPin } from "react-icons/gr";
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"


const HotelInfoSection = ({ data }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const {isAuthenticated} = useAuth()
    const router = useRouter()
    return (
        <section className="w-full py-10 px-0 md:px-20 ">
            <div className="p-10 sm:p-0 mx-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl mb-3 font-bold text-gray-800">{data.name}</h1>
                        <div className="flex items-center mt-2">
                            <div className="flex">
                                {[...Array(data.stars_rating)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="ml-2 text-gray-600">{data.stars_rating}-star hotel</span>
                        </div>
                        <div className="flex items-center mt-2 text-gray-600">
                            <GrLocationPin className="mr-1" />
                            <span>{data.location}</span>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                       <button className="p-2 rounded-xl border border-[var(--primary)]">
                            <Share2 className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
                        <p className="text-gray-600">
                            Experience luxury at its finest at the {data.name} in {data.location}.
                            Our {data.stars_rating}-star hotel offers world-class amenities and
                            exceptional service to make your stay unforgettable.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Amenities</h2>
                        <div className="flex flex-wrap gap-4">
                            {data.amenities.split(',').map((amenity, index) => (
                                <span key={index} className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700">
                                    {amenity.trim()}
                                </span>
                            ))}
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Location</h2>
                        <div className="flex items-start">
                            <Locate className="w-6 h-6 mt-1 mr-2 text-gray-600" />
                            <div>
                                <p className="text-gray-600">{data.address}</p>
                                <button className="mt-2 text-blue-500 hover:underline">
                                    View on map
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl shadow-lg h-fit">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-black">${data.price_per_night}</span>
                            <span className="text-gray-600">per night</span>
                        </div>
                        <div className="mb-6">
                            <div className="flex justify-between py-2 border-[var(--primary)]-[var(--primary)]">
                                <span className="text-gray-600">Rooms available</span>
                                <span className="font-medium">{data.total_rooms - data.total_occupied_rooms}</span>
                            </div>
                            <div className="flex justify-between py-2 border-[var(--primary)]-[var(--primary)]">
                                <span className="text-gray-600">Total rooms</span>
                                <span className="font-medium">{data.total_rooms}</span>
                            </div>
                        </div>
                        <button
                        onClick={(e) => {
                            localStorage.setItem('selectedStay', data.id)
                    
                            if (isAuthenticated) {
                              router.push('/Reservation_Hotel')
                            } else {
                              alert("You have to be authenticated in order to make a reservation")
                            router.push('/Sign/Sign_up')
                    
                            }
                          }}
                        className="w-full py-3 bg-[var(--secondary)] hover:bg-orange-600 text-white font-semibold rounded-xl transition duration-200">
                            Book Now
                        </button>
                        <div className="mt-4 text-center text-sm text-gray-500">
                            You won't be charged yet
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};




const FirstSec = ({ data }) => {
    if (!data) return null;

    return (
        <section
            className="relative h-full min-h-screen w-full flex justify-center mt-20 pb-24 pt-10 items-center mx-auto "   
        >
            <div className="w-[80%] h-[80%] flex flex-col justify-center gap-0 items-center bg-[var(--bg-color)] rounded-xl pb-14">
              
            <HotelInfoSection data={data} />
            <GallerySection  data={data} />
            </div>
        </section>
    );
};
const GallerySection = ({ data }) => {
    if (!data?.images) return null;

    return (
        <section className="w-full py-10 px-10 sm:px-0 md:px-20 bg-gray-50">
            <div className=" mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.images.map((image, index) => (
                        <div key={index} className="overflow-hidden rounded-lg shadow-md">
                            <Image
                                src={`${API_URL}${image.image}`}
                                alt={`Hotel image ${index}`}
                                width={400}
                                height={300}
                                className="w-full h-64 object-cover hover:scale-105 transition duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default function TripDetail() {
    const [stayDetails, setStayDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const router = useRouter();
    const isAuthenticated = useAuth()

    useEffect(() => {
        const staySelected = localStorage.getItem("selectedStay")
        const fetchDetails = async () => {
            if (!staySelected) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                const response = await fetch(`${API_URL}/hotel_details/${staySelected}`)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                setStayDetails(data)
            } catch (err) {
                console.error("Fetch error:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchDetails()
    }, [])

    if (loading) return (
        <div className="w-full min-h-screen bg-[var(--bg)] flex justify-center items-center">
            <NavBar />
            <div className="mt-20">Loading stay details...</div>
        </div>
    )

    if (error) return (
        <div className="w-full min-h-screen bg-[var(--bg)]">
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
    )

    return (
        <div className="w-full min-h-screen py-4 bg-[var(--bg)]">
            <NavBar />
            {stayDetails ? (
                <>
                    <FirstSec data={stayDetails} />
                </>
            ) : (
                <div className="text-center mt-20">
                    No trip selected or no details available
                </div>
            )}
            <Footer />
        </div>
    )
}