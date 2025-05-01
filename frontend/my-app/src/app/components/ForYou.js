'use client'

import Link from "next/link";
import { planePaper } from "../data/data";
import { API_URL } from "../utils/constants";
import { useEffect, useState } from "react";


export default function foryou() {
  const [recomendations, steRecomendations] = useState([])
  const fetchRecomendation = async () => {

    const token = localStorage.getItem("accessToken");
    console.log(token)
    try {
      const response = await fetch(`${API_URL}/recommended_trips/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if(
        !response.ok
      ){
        throw new Error(response.status)
      }
      const data = await response.json()
      console.log(data)
      steRecomendations(data.recommendations)
    } catch (err) {
      if(err === 403)
      {
        steRecomendations([])
        
      }
    }


  }


  useEffect(() => {

    fetchRecomendation()
  }, [])

  const flightsImage = '/flightsImage.jpg'
  const hotelsImage = '/hotelsImage.jpg'
  return recomendations.length && (
    <section className=" h-screen flex justify-center mt-6 items-center w-full mx-auto">
      <div className="w-[80%] mx-auto">

      </div>
    </section>)

}
