import Image from "next/image"
import cover from "/public/framePlane.png"
import FlightSearch from "./searchBox"

export default function Hero2(){

    return (
        <div className="w-[85%]   mt-0  lg:h-screen relative   mx-auto  pb-5 flex flex-col  justify-start  items-center  ">
         <div className="bg-no-repeat h-1/3  lg:h-3/4 w-full bg-[url('/coverNotCon.png')] bg-center bg-cover  rounded-3xl" >{/** */}  
         </div>
         <div className="absolute bottom-[5%] w-[88%]">
            <FlightSearch />
         </div>
         </div>
    )
}