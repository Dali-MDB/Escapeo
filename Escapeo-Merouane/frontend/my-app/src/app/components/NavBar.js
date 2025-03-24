"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "/public/logoWhite.png";
import logpBlack from '/public/logo.png'
import { usePathname } from "next/navigation";
import { Urbanist } from "next/font/google";
import { useState } from "react";
import ProfileCard from "./ProfileCard";
import img from "/public/photo.png";
import heart from "/public/heartWhite.png";
import { navLinks } from "../data/data";
import { useAuth } from '../context/AuthContext'; // Import useAuth

const urbanist = Urbanist({ subsets: ["latin"], weight: "400" });

// Left Section Component
const LeftSection = ({ path }) => {
  return (
    <div className="w-full z-20  h-full flex justify-start items-center">
      <div className="w-1/2 h-full flex flex-row justify-evenly gap-2 items-center">
        {navLinks.map(({ title, link, icon }, index) => (
          <div
            key={index}
            className={`z-30 flex flex-col justify-center h-full items-center relative ${
              path === link ? "shadow-[inset_0_-5px_white]" : ""
            }`}
          >
            <Link
              href={link}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span>{icon}</span>
              <span className="hidden lg:flex">{title}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// Center Section Component


// Right Section Component
const RightSectionCon = ({ clicked, setClicked }) => {
  return (
    <div className="w-full z-20 flex   justify-end items-center">
      <div className="w-1/2 flex flex-row items-center">
        <div className="flex w-full items-center justify-end gap-3">
          <Link href='/Setting/Favourite' className="flex justify-between gap-x-2 items-center">
            <Image src={heart} alt="Favorites" height={30} width={30} />
            <span className="hidden 2xl:flex">Favorites</span>
          </Link>
          <span className="hidden 2xl:flex">|</span>
        </div>
        <div className="flex w-full cursor-pointer items-center justify-end gap-3">
          <div className="flex justify-around items-center relative">
            <Image src={img} alt="Profile" height={40} width={40} />
            <div
              className={`w-[15px] h-[15px] rounded-full object-contain flex justify-center items-center absolute right-0 bottom-0 ${
                clicked ? "bg-[#4B6382]" : `bg-[#A68868]`
              }`}
              onClick={() => setClicked(!clicked)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <rect width="24" height="24" fill="none" />
                <path
                  fill="#000"
                  d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z"
                />
              </svg>
            </div>
          </div>

          <Link  href={"/Setting/Account"} className="hidden 2xl:flex xl:text-lg">John D.</Link>

          {clicked && <ProfileCard />}
        </div>
      </div>
    </div>
  );
};

const RightSectionUnCon = () =>{
  return (  
  <div className="w-full z-20 flex justify-end items-center">

    <div className="w-1/2 font-bold flex flex-row justify-evenly text-center items-center">
    <Link href={'/Log/Login'}    className="w-full h-full rounded-md p-2">Login</Link>
    <Link href={'/Sign/Sign_up'}  className="w-full h-full rounded-md p-2 text-black bg-white">Sign up</Link>
    
    </div>
  </div>
  )
}


// Main NavBar Component
export default function NavBar() {
  const { isAuthenticated } = useAuth();
  const [clicked, setClicked] = useState(false);
  const path = usePathname(); // Always call usePathname
  const CenterSection = () => {
    return (
      <div className="w-full z-20 h-full p-0 flex justify-evenly items-center">
        <div className="flex justify-center items-center w-1/2 h-full">
          <Link href="/" aria-label="Home" className="w-1/2">
            <Image
              src={isAuthenticated ? Logo : logpBlack }
              height={0}
              width={0}
              style={{ width: "", height: "" }}
              alt="Logo"
              priority={true}
            />
          </Link>
        </div>
      </div>
    );
  };
  return (
    <div className={`w-[90%]   h-24 sticky left-[5%] top-[5%]  ${isAuthenticated ? "bg-[#235784]" : "bg-[rgba(255,250,250,0.3)] text-black"} flex px-10 flex-row z-50 rounded-full justify-between items-center ${isAuthenticated && "shadow-[0_4px_4px_1px_rgba(0,0,0,0.3)]"}`}>
      <LeftSection path={path} />
      <CenterSection />
   { isAuthenticated ?  <RightSectionCon clicked={clicked} setClicked={setClicked} /> : <RightSectionUnCon />
        } </div>
  );
}