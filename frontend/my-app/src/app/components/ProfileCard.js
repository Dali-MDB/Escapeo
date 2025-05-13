import Image from "next/image";
import Link from "next/link";
import img from "/public/globe.svg";
import vector from "/public/Vector.png";
import card from "/public/card.png";
import settings from "/public/settings.png";
import arrow from "/public/arrow.png";
import support from "/public/Support.png";
import Logout from "/public/logout.png";
import { logout } from "../utils/auth";
import { MessageCircle, Settings, User, History, Calendar, LayoutDashboard } from "lucide-react";

export default function ProfileCard({ isAdmin, profile }) {
  const menuItemsCustomers = [
    { title: "My account", link: "/Setting/Account", icon: User },
    { title: "History", link: "/Setting/History", icon: History },
    { title: "Settings", link: "/Setting/Account", icon: Settings },
  ];

  const menuItemsAdmins = [
    { title: "Admin Dashboard", link: "/Dashboard/Home", icon: LayoutDashboard },
    { title: "My Account", link: "/Dashboard/Profile", icon: User },
    { title: "Calendar", link: "/Dashboard/Calendar", icon: Calendar },
    { title: "Chat", link: "/Dashboard/Messages", icon: MessageCircle },

  ];


  const menuItems = isAdmin ? menuItemsAdmins : menuItemsCustomers;
  const secondaryItems = [
    { title: "Support", link: "/Setting/Help", icon: support },
  ];



  return (
    <div
      className="w-[15%] min-w-60 absolute right-[2.5%] top-28 text-[#efefef]"
    >
      {/* Triangle Indicator */}
      <div
        className="absolute top-[-15px] z-20 left-[81%] sm:left-3/4 transform -translate-x-1/2 w-0 h-0 
                   border-l-[25px] border-l-transparent 
                   border-r-[25px] border-r-transparent 
                   border-b-[20px] border-b-[#4B6382]"
      ></div>

      <div className="bg-[#4B6382] rounded-md py-5 flex flex-col items-center">
        {/* Profile Section */}
        <div className="w-[80%] flex gap-4  items-center pb-6 border-b border-gray-300">
          <Link href={isAdmin ? "/Dashboard/Profile" : "/Setting/Account"} className="flex gap-4 items-center">
            <div className="rounded-full   overflow-hidden max-h-12 max-w-12 border border-[var(--primary)]">
              <Image width={150} height={150} alt="a" unoptimized src={`http://127.0.0.1:8000${profile.profile_picture}`}
              /></div>
            <div className="flex flex-col items-start">
              <h1 className="font-bold text-xl text-white">{profile.username || "John Doe"}</h1>
              <h5 className="text-md text-gray-200">Online</h5>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="w-3/4 pt-6 pb-6 flex flex-col gap-4 border-b border-gray-300">
          {menuItems.map((item, index) => (
            <Link
              href={item.link}
              key={index}
              className="flex justify-between items-center w-full "
              aria-label={item.title}
            >
              <span className="flex items-center gap-3">
                {item.icon && <item.icon size={20} />}
                {item.title}
              </span>
              <Image src={arrow} className="h-2" height={2} width={5} alt="arrow" />
            </Link>
          ))}
        </div>

        {/* Support & Logout */}
        <div className="w-3/4 pt-6 flex flex-col gap-4">
          {



            !isAdmin && secondaryItems.map((item, index) => (
              <Link
                href={item.link}
                key={index}
                className="flex justify-between items-center w-full "
                aria-label={item.title}
              >
                <span className="flex items-center gap-3">
                  <Image src={item.icon} width={20} height={20} alt={item.title} />
                  {item.title}
                </span>
                <Image src={arrow} className="h-2" height={2} width={5} alt="arrow" />
              </Link>
            ))}
        </div>
        <div className="w-3/4 pt-6 flex flex-col gap-4">
          <button
            onClick={logout}
            className="flex justify-between items-center w-full "
            aria-label="Logout"
          >
            <span className="flex items-center gap-3">
              <Image src={Logout} width={20} height={20} alt={"Logout"} />
              Logout
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}