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
import { navLinks } from "../data/data";

const urbanist = Urbanist({ subsets: ["latin"], weight: "400" });

export default function NavbarConnected() {
  const [clicked, setClicked] = useState(false);
  const path = usePathname(); // Always call usePathname

  return (
    <div className="w-[85%] font- h-20 absolute left-[7.5%] top-[5%]  bg-[#4B6382] flex px-10 flex-row z-50 rounded-full justify-between items-center shadow-[0_4px_4px_1px_rgba(0,0,0,0.3)]">
      <div className="w-full h-full flex justify-start items-center">
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
      <div className="w-full flex justify-evenly items-center">
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
      <div className="w-full  flex justify-end items-center">
        <div className="w-1/2 flex flex-row  items-center">
          <div className="flex w-full items-center justify-end gap-3 ">
            <span className="flex justify-between gap-x-2 items-center">
              <Image src={heart} alt="Favorites" height={30} width={30} />
              <span className="hidden 2xl:flex">Favorites</span>
            </span>
            <span className="hidden 2xl:flex">|</span>
          </div>
          <div className="flex w-full cursor-pointer items-center justify-end gap-3">
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

            <span className="hidden 2xl:flex xl:text-lg ">John D.</span>

            {clicked && <ProfileCard />}
          </div>
        </div>
      </div>
    </div>
  );
}
