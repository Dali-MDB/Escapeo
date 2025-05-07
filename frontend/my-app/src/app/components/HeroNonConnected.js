import Image from "next/image"
import cover from "/public/framePlane.png"
import FlightSearch from "./searchBox"

export default function Hero2(){

    return (
        <div className="w-full  h-[88vh] mt-16 top-0 py-2    relative  mx-auto   flex flex-col  justify-start  items-center  ">
         <div className="w-[90%] z-10 bg-no-repeat h-3/4  bg-[url('/coverNotCon.png')] bg-center bg-cover  rounded-3xl" >{/** */}  
         </div>
         <div className="absolute bottom-28 z-30 w-[85%]">
            <FlightSearch />
         </div>
         </div>
    )
}