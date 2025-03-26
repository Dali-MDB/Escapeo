"use client";
import Link from "next/link";
import Image from "next/image";
import img from "/public/photo.png";
import heart from "/public/heartWhite.png";
import Input from "./Input";

export default function Navbar() {
  const LeftSection = () => {
    return <div className="w-full pl-10 flex text-white flex-row justify-start items-center">
      <Input />
    </div>;
  };
  const RightSectionCon = () => {
    return (
      <div className="w-1/2 z-20 flex  text-white justify-end items-center">
        <div className="w-1/2 flex flex-row items-center">
          <div className="flex w-full items-center justify-end gap-3">
            <Link
              href="/Setting/Favourite"
              className="flex justify-between gap-x-2 items-center"
            >
              <Image src={heart} alt="Favorites" height={30} width={30} />
              <span className="hidden 2xl:flex">Favorites</span>
            </Link>
            <span className="hidden 2xl:flex">|</span>
          </div>
          <div className="flex w-full cursor-pointer items-center justify-end gap-3">
            <div className="flex justify-around items-center relative">
              <Image src={img} alt="Profile" height={40} width={40} />
            </div>

            <Link
              href={"/Dashboard/Account"}
              className="hidden 2xl:flex xl:text-lg"
            >
              John D.
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-[90%]   h-24 sticky left-[5%] top-[5%]  bg-[#235784] text-black flex px-10 flex-row z-50 rounded-full justify-between items-center shadow-[0_4px_4px_1px_rgba(0,0,0,0.3)]`}
    >
      <LeftSection />
      <RightSectionCon />
    </div>
  );
}
