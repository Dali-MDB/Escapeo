import Image from "next/image"
import cover from "/public/framePlane.png"
import FlightSearch from "./searchBox"

export default function Hero(){

    return (
        <div className="w-full relative  h-[88vh]  mt-16      mx-auto  py-2 flex flex-col  justify-start items-center  ">
         <div className="w-[90%] z-10 bg-no-repeat h-3/4  bg-[url('/framePlane.png')] bg-center bg-cover  rounded-3xl" >{/** */}  
         </div>
         <div className="absolute bottom-28 z-10 w-[80%]">
            <FlightSearch />
         </div>
         </div>
    )
}