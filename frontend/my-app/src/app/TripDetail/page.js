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

const FirstSec = ({ data }) => {
  if (!data) return null;



  return (
    <section
      className="relative h-full w-full flex justify-center mt-20 py-14 items-center mx-auto"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-[80%] h-[80%] flex flex-col justify-center gap-0 items-center  py-32">
        <div className="w-full min-h-[60vh] flex flex-col justify-between  items-center">
          <div className="w-full  h-full flex flex-row justify-between items-start">
            <div className="w-full h-full flex flex-col items-start justify-start mx-auto px-0 py-10">
              <h1 className="text-5xl font-bold mb-4">{data.title}</h1>
              <h1 className="text-lg font-bold mb-4 flex items-center">{<IoLocationOutline size={20} />}Gümüssuyu Mah. Inönü Cad. No:8, Istanbul 34437</h1>
              <div className="flex items-center gap-4">
                <button className="w-fit flex gap-2 text-xl items-center text-[var(--primary)] h-full px-2 py-1 border border-[var(--primary)]">{data.stars_rating}.2 </button>
                <p className="text-lg">Very good</p>
              </div>
            </div>
            <div className="max-w-72 w-full h-full flex flex-row items-center gap-4 justify-end mx-auto px-4 py-10">
              {/* Add more trip details here */}
              <button className="w-fit border p-3"><Heart size={20} /></button>
              <button className="w-fit border p-3"><Share2 size={20} /></button>
            </div>
          </div>
          <div className="h-full w-full grid grid-cols-2 grid-rows-2  gap-1 max-h-[60vh]">
            {data?.images &&
              data.images.slice(1, 4).map((el, index) => <Image key={index} alt={`picture ${data.index}`} src={`${API_URL}${el.image}`}
                width={500} height={600} className={`${index === 0 && "row-span-2"} h-full w-full`} />)
            }
          </div>
        </div>



      </div>

    </section>
  );
};
import { GrLocationPin } from "react-icons/gr";
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

const DepartureBox = (data) => {
  const {isAuthenticated} = useAuth()
  console.log(isAuthenticated)
  return (
  <div className={`w-full py-6 px-0   border-[var(--primary)] ${data.index !== data.length - 1 && "border-b-[0.5px]"}  flex justify-between items-center`}>
    <div className="w-full flex justify-start items-center  gap-8">
      <p className="text-xl flex items-center gap-2">{<GrLocationPin size={20} />}<span className="font-bold">
        {data.location} - {data.destination}</span></p>
      <p className="text-xl font-bold">Capacity: <span className="font-medium">{data.capacity}</span></p>
      <p className="text-xl font-bold">Class: <span className="font-medium"> {data.price_category}</span></p>
    </div>
    <div className="flex w-1/4 justify-end">
      <div className="w-fit px-8 py-2 text-xl text-[var(--primary)] font-semibold  rounded-xl">$ {data.price}</div>
      <button className="w-fit px-8 py-2 text-xl  font-semibold bg-[var(--secondary)] rounded-xl" onClick={(e) => {
        e.preventDefault()
        localStorage.setItem('departureId', data.id)

        if (isAuthenticated) {
          data.router.push('/Reservation')
        } else {
          alert("You have to be authenticated in order to make a reservation")
          data.router.push('/Sign/Sign_up')

        }
      }}>Book</button>
    </div>


  </div>
)}



const SecondSec = (data) => {
  return (
    <div className="relative h-full w-[80%] rounded-xl  flex flex-col gap-14 justify-center my-20 py-6 items-center mx-auto px-6">
      <div className="w-full flex flex-col  gap-6">
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-md">{data.data.description}</p>
        <button className="w-32 mt-6 flex flex-col justify-between gap-4 rounded-xl items-start py-6 px-4 bg-[var(--primary)] text-lg text-[var(--bg-color)] font-somibold">
          <span className="w-fit font-bold text-2xl">{data.data.stars_rating}.2</span>
          <span className="w-fit font-bold text-sm">Very good</span>

        </button>
      </div>
      <div className="w-full flex flex-col justify-start items-start gap-4">
        <h1 className="text-3xl font-bold">Departures</h1>
        {data.data.departure_places.map((el, index) => (<DepartureBox key={index} isAuthenticated={data.isAuthenticated} index={index} length={data.data.departure_places.length} destination={data.destination} price_category={data.price_category} router={data.router} {...el} />))}

      </div>
    </div>
  )

}

export default function TripDetail() {
  const [tripDetails, setTripDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter();
  const isAuthenticated = useAuth()
  useEffect(() => {
    const tripSelected = localStorage.getItem("tripSelected")
    const fetchDetails = async () => {
      if (!tripSelected) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_URL}/trip_details/${tripSelected}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setTripDetails(data)
        console.log(JSON.stringify(data))
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    const fetchDepartures = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_URL}/departure_details/${tripSelected}/1`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log(data)
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
      <div className="mt-20">Loading trip details...</div>
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
      {tripDetails ? (
        <>
          <FirstSec data={tripDetails} />
          {/* Add more sections to display other trip details */}
          <SecondSec isAuthenticated={isAuthenticated} data={tripDetails} router={router} />
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