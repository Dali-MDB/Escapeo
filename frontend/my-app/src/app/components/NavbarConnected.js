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
import {navLinks} from "../data/data"

const urbanist = Urbanist({ subsets: ["latin"], weight: "400" });

export default function NavbarConnected() {
  const [clicked, setClicked] = useState(false);
  const path = usePathname(); // Always call usePathname
  

  return (
    <div className="text-[#ffffff] absolute top-16 z-30 shadow-[0_4px_4px_1px_rgba(0,0,0,0.3)] w-[85%] font-urbanist text-sm md:text-lg sm:font-semibold rounded-full left-[7.5%] flex flex-row justify-evenly items-center py-0 sm:py-1 h-14 sm:h-28 px-8 sm:px-20 bg-[#4B6382] gap-5">
      {/* Left Section */}
      <div className="flex text-sm w-full h-full items-center justify-start">
        <div className="flex w-1/4 sm:w-auto flex-row justify-evenly sm:justify-between gap-5 sm:gap-10 items-center">
          {navLinks.map(({ title, link, icon }, index) => (
            <div
              key={index}
              className={`z-30 flex flex-col justify-center h-full items-center relative ${
                path=== link ? "shadow-[0_0_-4px_0_#4B6382]" : ""
              }`}
            >
              <Link href={link} className="flex items-center gap-2 cursor-pointer">
                <span>{icon}</span>
                <span className="hidden lg:flex">{title}</span>
              </Link>
              {console.log(path+link)}
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

            {clicked && <ProfileCard />}
          </div>
        </div>
      </div>
    </div>
  );
}
