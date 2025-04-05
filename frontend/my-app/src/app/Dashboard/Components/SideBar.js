"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Account, History, Favourite, Help  , dashboardIconBlack   } from "@/app/Setting/data";

import { calendarIcon, flightIcon ,message } from "@/app/Setting/data";

export default function SideBar() {
  const tab = usePathname(); // Get the current path

  const tabs = [
    { name: "Dashboard", icon: dashboardIconBlack, path: "/Dashboard/Home" },
    { name: "Calendar", icon: calendarIcon, path: "/Dashboard/Calendar" },
    { name: "Trips", icon: flightIcon, path: "/Dashboard/Trips" },
    { name: "Messages", icon: message, path: "/Dashboard/Messages" },
    { name: "Profile", icon: Account, path: "/Dashboard/Profile" },
];

  return (
    <div className="w-1/3 text-lg h-fit font-semibold bg-[#FEF8F5] p-6 gap-6  rounded-2xl flex flex-col justify-center items-center text-left">
      {tabs.map((el, index) => {
        
        
  const arrow = (<svg xmlns="http://www.w3.org/2000/svg" width={14} height={28} viewBox="0 0 12 24">
    <path fill={`${
            tab === el.path ? " #fff" : "#000"
          }`} fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"></path>
  </svg>)
        return (
        <Link
          key={index}
          href={el.path}
          className={`w-full h-full px-4 py-4 rounded-xl flex gap-5 items-center justify-between ${
            tab === el.path ? "bg-[#235784] shadow-[0_7px_10px_0px_rgba(0,0,0,0.2)] text-white" : "bg-gray-300"
          } rounded-lg `}
        >
          <span className="w-full flex flex-row justify-start gap-5 text-left items-center">{el.icon} {el.name}</span>
           <span className={`w-full flex justify-end items-center ${
            tab === el.path ? " text-white" : "text-black"
          }`}>{arrow}</span>
        </Link>
      )})
    }
    </div>
  );
}