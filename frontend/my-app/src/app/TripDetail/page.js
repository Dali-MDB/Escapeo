'use client'
import { useForm } from "../context/FormContext"
import { API_URL } from "../utils/constants"
import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import Image from "next/image"
import { Heart, Star } from "lucide-react"
import HistoryBox from "../Setting/components/HistoryBox"
const bg = "/bg.png"; // Ensure this path is correct

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
      <div className="w-full h-[80%] flex flex-col justify-center gap-0 items-center p-10 py-32">
        <div className="w-full min-h-[60vh] flex flex-col justify-between  items-center">
          <div className="w-full max-w-[80vw] h-full flex flex-row justify-between items-center">
            <div className="w-full h-full flex flex-col items-start justify-start mx-auto px-4 py-10">
              <h1 className="text-5xl font-bold mb-4">{data.title}</h1>
              <p className="text-xl mb-4">{data.description}</p>

              <button className="w-fit flex gap-2 text-xl items-center  h-full "><span className="p-2  border">{data.stars_rating}.2</span> Very good</button>
              {/* Add more trip details here */}
            </div>
            <div className="max-w-72 w-full h-full flex flex-row items-center gap-4 justify-end mx-auto px-4 py-10">
              {/* Add more trip details here */}
              <button className="w-fit"><Heart size={40} /></button>
              <button className="w-full p-4 bg-[var(--primary)] text-xl text-[var(--bg-color)]">Book Now</button>
            </div>
          </div>
          <div className="h-full w-full flex items-center justify-center ">
            {data?.images &&

              <Image
                src={"/flightsImage.jpg"}
                alt="Trip image"
                width={300}
                height={200}
                className="rounded-xl shadow-xl w-full max-w-[80vw] h-[60vh] rounded-[40px]  object-cover"
                priority

              />

            }
          </div>

          

        </div> <div className="w-full max-w-[80vw] my-24 mx-auto rounded-xl p-6 bg-[var(--bg-color)] text-[var(--primary)] flex flex-col gap-4 justify-between items-center">
        <div className="w-full flex justify-between items-center">
          <div className="w-full flex flex-col">
            <span className="text-4xl font-bold text-left w-full px-4">{data?.title}</span>
            <span className="text-2xl font-semibold text-left w-full px-4">{data?.destination}</span>
          </div>
          <>  <h2 className="w-full rounded-xl py-4 px-4 text-xl text-right "> {data.departure_date} </h2>
          </>
        </div>
        <span className="text-xl font-semibold flex w-full items-center justify-between gap-14 flex-row">
          <h3 className="w-full rounded-xl py-4 px-4  text-xl text-left ">{" "}{data.price_category}</h3>
          <h3 className="w-1/2 rounded-xl py-4  px-4 text-xl text-right "> {" "}{data.experience}</h3>

        </span>
        {data.is_one_way ? <span className="text-xl font-semibold flex w-fit items-center justify-center absolute  p-4 rounded-xl bg-[var(--secondary>)] text-[var(--bg-color)] flex-row">One way</span>

          :
          <span className="text-xl font-semibold flex w-full items-center justify-between gap-14 flex-row"></span>

        }



      </div>
      </div>
     
    </section>
  );
};

export default function TripDetail() {
  const { tripSelected } = useForm()
  const [tripDetails, setTripDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
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
        console.log(data)
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    const fetchDepartures = async () =>{
      try{
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

        </>
      ) : (
        <div className="text-center mt-20">
          No trip selected or no details available
        </div>
      )}

    </div>
  )
}