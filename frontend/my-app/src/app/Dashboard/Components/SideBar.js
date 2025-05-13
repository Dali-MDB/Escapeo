"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Account, History, Favourite, Help, dashboardIconBlack, stayIcon } from "@/app/Setting/data";
import { addIcon, calendarIcon, flightIcon, reservationIcon, message } from "@/app/Setting/data";
import { useEffect, useState } from "react";
import { getMyProfile } from "@/app/utils/auth";
import { Add } from "@mui/icons-material";
import { FaTripadvisor } from "react-icons/fa";

export default function SideBar() {
  const [isFlightResp, setIsFlightResp] = useState(false);
  const [isStayResp, setIsStayResp] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const func = async () => {
      const response = await getMyProfile();
      const department = response.profile?.department;
      setIsFlightResp(department === 'owner' || department === 'staff');
      setIsOwner(department === 'owner');
      setIsStayResp(department === 'owner' || department === 'hotel_manager');
    };
    func();
  }, []);

  const tab = usePathname();

  const tabs = [
    { name: "Dashboard", icon: dashboardIconBlack, path: "/Dashboard/Home", show: true },
    { name: "Profile", icon: Account, path: "/Dashboard/Profile", show: true },
    { name: "My added trips", icon: <FaTripadvisor />, path: "/Dashboard/MyTrips", show: true },
    { name: "Add a Trip", icon: flightIcon, path: "/Dashboard/Trips", show: isFlightResp },
    { name: "Add a Stay", icon: stayIcon, path: "/Dashboard/Stays", show: isStayResp },
    { name: "Messages", icon: message, path: "/Dashboard/Messages", show: true },
    { name: "Reservations", icon: reservationIcon, path: "/Dashboard/Reservations", show: true },
    { name: "Calendar", icon: calendarIcon, path: "/Dashboard/Calendar", show: true },
  ];

  const ArrowIcon = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={28} viewBox="0 0 12 24">
      <path 
        fill={isActive ? "#fff" : "#000"} 
        fillRule="evenodd" 
        d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"
      />
    </svg>
  );

  return (
    <div className="w-1/3 text-lg h-fit font-semibold bg-[var(--bg-color)] p-6 gap-6 rounded-2xl flex flex-col justify-center items-center text-left">
      {tabs.map((el) => {
        if (!el.show) return null;
        
        const isActive = tab === el.path;
        return (
          <Link
            key={el.path}
            href={el.path}
            className={`w-full h-full px-4 py-4 rounded-xl flex gap-5 items-center justify-between ${
              isActive 
                ? "bg-[var(--primary)] shadow-[0_7px_10px_0px_rgba(0,0,0,0.2)] text-white" 
                : "bg-gray-300"
            } rounded-lg`}
          >
            <span className="w-full flex flex-row justify-start gap-5 text-left items-center">
              {el.icon} {el.name}
            </span>
            <span className={`w-1/22 flex justify-end items-center ${isActive ? "text-white" : "text-black"}`}>
              <ArrowIcon isActive={isActive} />
            </span>
          </Link>
        );
      })}

      {isOwner && (
        <Link
          href="/Dashboard/Add_Admin"
          className={`w-full h-full px-4 py-4 rounded-xl flex gap-5 items-center justify-between ${
            tab === "/Dashboard/Add_Admin" 
              ? "bg-[var(--primary)] shadow-[0_7px_10px_0px_rgba(0,0,0,0.2)] text-white" 
              : "bg-gray-300"
          } rounded-lg`}
        >
          <span className="w-full flex flex-row justify-start gap-5 text-left items-center">
            {addIcon} add admin
          </span>
          <ArrowIcon isActive={tab === "/Dashboard/Add_Admin"} />
        </Link>
      )}
    </div>
  );
}