import Image from "next/image"
import cover from "/public/framePlane.png"
import FlightSearch from "./searchBox"

export default function Hero(){

    return (
        <div className="w-[85%]  h-[60vh] sm:h-[80vh] mt-24 sm:mt-0 lg:h-screen relative  lg:mt-1 mx-auto  py-5 flex flex-col  justify-start lg:justify-center items-center  ">
         <div className="bg-no-repeat h-1/3  lg:h-3/4 w-full bg-[url('/framePlane.png')] bg-center bg-cover  rounded-3xl" >{/** */}  
         </div>
         <div className="absolute bottom-[-50px] w-[88%]">
            <FlightSearch />
         </div>
         </div>
    )
}