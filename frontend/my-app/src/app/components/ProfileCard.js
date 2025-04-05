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

export default function ProfileCard() {
  const menuItems = [
    { title: "My account", link: "/Setting/Account", icon: vector },
    { title: "History", link: "/Setting/History", icon: card },
    { title: "Settings", link: "/Setting/Account", icon: settings },
  ];

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
        <div className="w-[80%] flex gap-4 items-center pb-6 border-b border-gray-300">
          <Link href={"/Setting/Account"} className="flex gap-2">
            <div className="rounded-full flex justify-center items-center">
              <Image src={img} height={50} width={50} alt="Profile Image" priority />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="font-bold text-lg text-white">John Doe</h1>
              <h5 className="text-sm text-gray-200">Online</h5>
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
                <Image src={item.icon} width={20} height={20} alt={item.title} />
                {item.title}
              </span>
              <Image src={arrow} className="h-2" height={2} width={5} alt="arrow" />
            </Link>
          ))}
        </div>

        {/* Support & Logout */}
        <div className="w-3/4 pt-6 flex flex-col gap-4">
          {secondaryItems.map((item, index) => (
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