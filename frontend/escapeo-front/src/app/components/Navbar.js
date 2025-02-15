import Link from "next/link"


export default function Navbar() {
    return (
        <div className="text-black w-full flex justify-between py-5 px-8 bg-[#CDD5D8]">
            <div className="flex justify-around sm:w-[50%] md:w-[20%] items-center ">
            <Link href={'/Flights'}>Find Flights</Link>
            <Link href={'/Hotels'}>Find Stays</Link>
            </div>
            <div className="w-[80%] text-center flex justify-center items-center">
                Logo
            </div>
            <div className="w-[35%] max-w-xs flex justify-evenly items-center">
                <button className="w-full">
                    Login
                </button>
                <button className="text-[#CDD5D8] w-full bg-[#A68868] p-2 rounded-lg">
                    Sign up
                </button>
            </div>
        </div>
    )   
}