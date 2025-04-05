"use client";
import { modify, plus } from "@/app/Setting/data";
import { FaFacebook , FaLinkedinIn  , FaGithub , FaTwitter , FaSlack } from "react-icons/fa";
export default function Profile() {
  return (
    <div className="w-full py-0 px-2 flex flex-col ">
      <div
        className="bg-[url('/coverProfile.jpg')] flex justify-end items-end w-full h-80 rounded-t-2xl z-0"
        style={{ backgroundPosition: "center", backgroundSize: "cover" }}
      >
        <div className="rounded-full w-64 h-64 p-1 mx-auto mb-[-120px] bg-[#EEDAC4] flex justify-center object-contain items-center">
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundImage: `url(${"/JohnDoe.jpg"})`,
              backgroundSize: "cover",
            }}
          ></div>
        </div>
      </div>

      <div className="w-full rounded-b-2xl bg-[#FEF8F5] p-4 pt-32 pb-5">
        <div className=" w-full text-center py-5 gap-8 flex flex-col justify-start items-center">
           <div className="personal-info w-full gap-5 flex flex-col justify-center items-center text-center">

            <h1 className="text-5xl font-bold w-fit">John Doe</h1>
            <p className="w-fit text-lg ">UI/UX designer</p>
           </div>
            <div className="w-[40%] my-2 rounded-full shadow-md border-[1px]  py-3 flex flex-row justify-evenly items-center ">
            <span  className="w-full text-black text-lg ">200 post</span>
            <span  className="w-full text-black text-lg ">200 post</span>
            <span  className="w-full text-black text-lg ">200 post</span>
                
            </div>
            <div className="about px-48 gap-5 w-full flex flex-col justify-center items-center text-center">
                
            <h1 className="text-2xl font-semibold w-fit">About</h1>
       
                <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere fermentum urna, eu condimentum mauris tempus ut. Donec fermentum blandit aliquet. Etiam dictum dapibus ultricies. Sed vel aliquet libero. Nunc a augue fermentum, pharetra ligula sed, aliquam lacus.
                </p>
            </div>
            
            <div className="follow-me px-32 gap-4  w-full flex flex-col justify-center text-gray-600 items-center text-center">
                
                <h1 className="text-xl font-medium w-fit">Follow me </h1>
                <div className="w-1/2 flex items-center justify-center gap-4 text-2xl">
                <FaFacebook />
                <FaGithub />
                <FaLinkedinIn />
                <FaTwitter />
                <FaSlack />
                </div>
           
                </div>


        </div>
      </div>
    </div>
  );
}
