"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Account, History, Favourite, Help, dashboardIconBlack, stayIcon } from "@/app/Setting/data";

import {addIcon , calendarIcon, flightIcon, reservationIcon, message } from "@/app/Setting/data";
import { useEffect, useState } from "react";
import { getMyProfile } from "@/app/utils/auth";
import { Add } from "@mui/icons-material";



export default function SideBar() {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const func = async () => {
      const response = await getMyProfile()
      const department = response.profile?.department;
      setIsOwner(department === 'owner')

    }
    func()
  }, [])
  const tab = usePathname(); // Get the current path

  const tabs = [
    { name: "Dashboard", icon: dashboardIconBlack, path: "/Dashboard/Home" },
    { name: "Profile", icon: Account, path: "/Dashboard/Profile" },
    { name: "Add a Trip", icon: flightIcon, path: "/Dashboard/Trips" },
    { name: "Add a Stay", icon: stayIcon, path: "/Dashboard/Stays" },
    { name: "Messages", icon: message, path: "/Dashboard/Messages" },
    { name: "Reservations", icon: reservationIcon, path: "/Dashboard/Reservations" },
    { name: "Calendar", icon: calendarIcon, path: "/Dashboard/Calendar" },

  ];

  return (
    <div className="w-1/3 text-lg h-fit font-semibold bg-[var(--bg-color)] p-6 gap-6  rounded-2xl flex flex-col justify-center items-center text-left">
      {tabs.map((el, index) => {


        const arrow = (<svg xmlns="http://www.w3.org/2000/svg" width={14} height={28} viewBox="0 0 12 24">
          <path fill={`${tab === el.path ? " #fff" : "#000"
            }`} fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"></path>
        </svg>)
        return (
          <Link
            key={index}
            href={el.path}
            className={`w-full h-full px-4 py-4 rounded-xl flex gap-5 items-center justify-between ${tab === el.path ? "bg-[var(--primary)] shadow-[0_7px_10px_0px_rgba(0,0,0,0.2)] text-white" : "bg-gray-300"
              } rounded-lg `}
          >
            <span className="w-full flex flex-row justify-start gap-5 text-left items-center">{el.icon} {el.name}</span>
            <span className={`w-1/22 flex justify-end items-center ${tab === el.path ? " text-white" : "text-black"
              }`}>{arrow}</span>
          </Link>
        )
      })
      }
      {

        isOwner && (
          <Link
            href={"/Dashboard/Add_Admin"}
            className={`w-full h-full px-4 py-4 rounded-xl flex gap-5 items-center justify-between ${tab === "/Dashboard/Add_Admin" ? "bg-[var(--primary)] shadow-[0_7px_10px_0px_rgba(0,0,0,0.2)] text-white" : "bg-gray-300"
              } rounded-lg `}
          >
            <span className="w-full flex flex-row justify-start gap-5 text-left items-center">{addIcon} add admin</span>
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={28} viewBox="0 0 12 24">
              <path fill={`${tab === '/Dashboard/Add_Admin' ? " #fff" : "#000"
                }`} fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"></path>
            </svg>
          </Link>
        )
      }
    </div>
  );
}