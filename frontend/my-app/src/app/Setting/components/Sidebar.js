"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Account, History, Favourite, Help  } from "../data";

export default function Sidebar() {
  const tab = usePathname(); // Get the current path

  const tabs = [
    { name: "Account", icon: Account, path: "/Setting/Account" },
    { name: "History", icon: History, path: "/Setting/History" },
    { name: "Favourite", icon: Favourite, path: "/Setting/Favourite" },
    { name: "Help", icon: Help, path: "/Setting/Help" },
  ];

  return (
    <div className="w-1/2 text-xl h-fit font-bold bg-[var(--bg-color)] px-2 py-4 gap-3  rounded-xl flex flex-col justify-center items-center text-left">
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
          className={`w-full h-full px-4 py-4 rounded-xl flex gap-5 items-center ${
            tab === el.path ? "bg-[var(--primary)] shadow-[0_7px_10px_0px_rgba(0,0,0,0.2)] text-white" : "bg-transparent"
          } rounded-lg `}
        >
          <span className="w-full flex flex-row justify-start gap-2 items-center">{el.icon} {el.name}</span> <span className={`w-full flex justify-end items-center ${
            tab === el.path ? " text-white" : "text-black"
          }`}>{arrow}</span>
        </Link>
      )})
    }
    </div>
  );
}