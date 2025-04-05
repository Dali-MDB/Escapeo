import NavBar from "../components/NavBar"
import Image from "next/image"
import { bgColor } from "../data/data"

export default function Error(){

return (
    <main className={`w-[100%] h-[120vh] flex flex-1 justify-center items-center overflow-x-hidden no-scrollbar bg-[${bgColor}] mx-0 `}>
        <NavBar />
        <div className="w-90% h-[50vh] flex flex-col justify-center gap-0 items-center text-black">
            <div className="w-60% h-full p-10">

            <Image src={'/errImg.png'} width={500} height={500} alt="404 image"  />

            </div>
            <div className="w-full text-center py-5 flex flex-col justify-center gap-5 items-center"> 
                <h1 className="text-4xl font-bold ">Sorry, we can't find that page</h1>
                <p className="text-sm">You may have mistyped the address or the page may have moved.</p>
            </div>
            <div  className="w-full text-center p-5 flex flex-col justify-center items-center">
            <button className="w-fit py-3 px-6 bg-[#012E41] text-white rounded-lg font-semibold">
            Back to Home
            </button>
            </div>
        </div>
    </main>
)

}