"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "/public/logoWhite.png";
import { usePathname } from "next/navigation";
import { Urbanist } from "next/font/google";
import { useState, useEffect } from "react";
import ProfileCard from "./ProfileCard";
import img from "/public/photo.png";
import heart from "/public/heartWhite.png";

const urbanist = Urbanist({ subsets: ["latin"], weight: "400" });

export default function NavbarConnected() {
  const [isClient, setIsClient] = useState(false);
  const [clicked, setClicked] = useState(false);
  const path = usePathname(); // Always call usePathname

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    {
      title: "Find Flights",
      link: "Flights",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 512 512"
          aria-label="Find Flights"
        >
          <path
            fill="currentColor"
            d="M407.72 208c-2.72 0-14.44.08-18.67.31l-57.77 1.52L198.06 48h-62.81l74.59 164.61l-97.31 1.44L68.25 160H16.14l20.61 94.18c.15.54.33 1.07.53 1.59a.26.26 0 0 1 0 .15a15 15 0 0 0-.53 1.58L15.86 352h51.78l45.45-55l96.77 2.17L135.24 464h63l133-161.75l57.77 1.54c4.29.23 16 .31 18.66.31c24.35 0 44.27-3.34 59.21-9.94C492.22 283 496 265.46 496 256c0-30.06-33-48-88.28-48m-71.29 87.9"
          />
        </svg>
      ),
    },
    {
      title: "Find Stays",
      link: "/Hotels",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 512 512"
          aria-label="Find Stays"
        >
          <path
            fill="currentColor"
            d="M432 230.7a79.4 79.4 0 0 0-32-6.7H112a79.5 79.5 0 0 0-32 6.69A80.09 80.09 0 0 0 32 304v112a16 16 0 0 0 32 0v-8a8.1 8.1 0 0 1 8-8h368a8.1 8.1 0 0 1 8 8v8a16 16 0 0 0 32 0V304a80.09 80.09 0 0 0-48-73.3M376 80H136a56 56 0 0 0-56 56v72a4 4 0 0 0 5.11 3.84A95.5 95.5 0 0 1 112 208h4.23a4 4 0 0 0 4-3.55A32 32 0 0 1 152 176h56a32 32 0 0 1 31.8 28.45a4 4 0 0 0 4 3.55h24.46a4 4 0 0 0 4-3.55A32 32 0 0 1 304 176h56a32 32 0 0 1 31.8 28.45a4 4 0 0 0 4 3.55h4.2a95.5 95.5 0 0 1 26.89 3.85A4 4 0 0 0 432 208v-72a56 56 0 0 0-56-56"
          />
        </svg>
      ),
    },
  ];

  if (!isClient) {
    return null; // Render nothing on the server
  }

  return (
    <div className="text-[#ffffff] absolute top-16 z-30 shadow-[0_4px_4px_1px_rgba(0,0,0,0.3)] w-[85%] font-urbanist text-sm md:text-lg sm:font-semibold rounded-full left-[7.5%] flex flex-row justify-evenly items-center py-0 sm:py-1 h-14 sm:h-28 px-8 sm:px-20 bg-[#4B6382] gap-5">
      {/* Left Section */}
      <div className="flex text-sm w-full h-full items-center justify-start">
        <div className="flex w-1/4 sm:w-auto flex-row justify-evenly sm:justify-between gap-5 sm:gap-10 items-center">
          {navLinks.map(({ title, link, icon }, index) => (
            <div
              key={index}
              className={`flex flex-col justify-center h-full items-center relative ${
                path === link ? "shadow-[inset_0_-4px_0_#4B6382]" : ""
              }`}
            >
              <Link href={link} className="flex items-center gap-2 cursor-pointer">
                <span>{icon}</span>
                <span className="hidden lg:flex">{title}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Center Section */}
      <div className="flex justify-center items-center w-full">
        <div className="flex justify-center items-center w-fit">
          <Link href="/" aria-label="Home">
            <Image
              src={Logo}
              height={200}
              width={200}
              style={{ width: "auto", height: "auto" }}
              alt="Logo"
              priority={true}
            />
          </Link>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex justify-end items-center w-full">
        <div className="w-full sm:w-1/2 flex justify-around sm:justify-between items-center">
          <div className="flex w-full items-center justify-between sm:gap-8">
            <span className="flex justify-between gap-x-2 items-center">
              <Image src={heart} alt="Favorites" height={30} width={30} />
              <span className="hidden 2xl:flex">Favorites</span>
            </span>
            <span className="hidden 2xl:flex">|</span>
          </div>

          <div className="flex w-full cursor-pointer items-center justify-evenly sm:justify-evenly xl:justify-between md:pr-2 md:pl-3 gap-2 md:gap-3">
            <span className="flex justify-around items-center relative">
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
            </span>

            <span className="hidden 2xl:flex xl:text-lg">John D.</span>

            {isClient && clicked && <ProfileCard />}
          </div>
        </div>
      </div>
    </div>
  );
}