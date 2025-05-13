import Image from "next/image"
import cover from "/public/framePlane.png"
import FlightSearch from "./searchBox"

export default function Hero2(){

    return (
        <div className="w-full  h-[90vh] mt-16 sm:mt-20 lg:mt-24 top-0    relative  mx-auto  pb-5 flex flex-col  justify-start  items-center  ">
         <div className="w-[90%]  bg-no-repeat h-1/3  lg:h-3/4  bg-[url('/coverNotCon.png')] bg-center bg-cover  rounded-3xl" >{/** */}  
         </div>
         <div className="absolute w-[80%] z-40 mx-auto mt-56 sm:mt-72 lg:mt-auto lg:bottom-[5%]">
            <FlightSearch />
         </div>
         </div>
    )
}