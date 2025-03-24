import Image from "next/image"
import cover from "/public/framePlane.png"
import FlightSearch from "./searchBox"

export default function Hero2(){

    return (
        <div className="w-full  h-[90vh] mt-0 top-[-75px]    relative  mx-auto  pb-5 flex flex-col  justify-start  items-center  ">
         <div className="w-[90%] z-10 bg-no-repeat h-1/3  lg:h-3/4  bg-[url('/coverNotCon.png')] bg-center bg-cover  rounded-3xl" >{/** */}  
         </div>
         <div className="absolute bottom-[5%] z-30 w-[85%]">
            <FlightSearch />
         </div>
         </div>
    )
}