"use client";
import Link from "next/link";
import { useEffect } from "react";
import Image from "next/image";
import Logo from "/public/logoWhite.png";
import logpBlack from '/public/logo.png';
import { usePathname } from "next/navigation";
import { Urbanist } from "next/font/google";
import { useState } from "react";
import ProfileCard from "./ProfileCard";
import heart from "/public/heartWhite.png";
import { navLinks } from "../data/data";
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useForm } from "../context/FormContext";
import { getMyProfile } from "../utils/auth";
import { Heart } from "lucide-react";


import { AsyncCallbackSet } from "next/dist/server/lib/async-callback-set";
const urbanist = Urbanist({ subsets: ["latin"], weight: "400" });

// Left Section Component
const LeftSection = ({ path }) => {
  return (
    <div className="w-full z-20 h-full flex justify-start items-center">
      <div className="w-1/2 h-full flex flex-row justify-evenly gap-2 items-center">
        {navLinks.map(({ title, link, icon }, index) => (
          <div
            key={index}
            className={`z-30 flex flex-col justify-center h-full items-center relative ${
              path === link ? "shadow-[inset_0_-5px_white]" : ""
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
  );
};
const RightSectionCon = ({ clicked, setClicked }) => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);  
  useEffect(() => {

    async function fetchProfile() {
      try {
        const response = await getMyProfile();
        if (response.success) {
          const transformedData = {
            username: response.profile.username,
            email: response.profile.email,
            full_name:
              response.profile.first_name && response.profile.last_name
                ? `${response.profile.first_name} ${response.profile.last_name}`
                : response.profile.username,
            phone_number: response.profile.phone_number,
            address:
              response.profile.city && response.profile.country
                ? `${response.profile.city}, ${response.profile.country}`
                : null,
            date_of_birth: response.profile.birthdate,
            profile_picture: '/JohnDoe.jpg',
          };
          setProfileData(transformedData);
          setIsAdmin(response.isAdmin);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error: {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        No profile data found.
      </div>
    );
  }

  return (
    <div className="w-full z-20 flex justify-end items-center">
      <div className="w-1/2 flex flex-row items-center">
        {
          
          !isAdmin && <div className="flex w-full items-center justify-end gap-3">
          <Link href='/Setting/Favourite' className="flex justify-between gap-x-2 items-center">
            {Heart && <Heart size={20} color="white" />}
            <span className="hidden 2xl:flex">Favorites</span>
          </Link>
          <span className="hidden 2xl:flex">|</span>
        </div>
        }<div className="flex w-full cursor-pointer items-center justify-end gap-3">
          <div className="flex justify-around items-center relative">
            <Image 
              src={profileData?.profile_picture || "/public/JohnDoe.jpg"} 
              alt="Profile" 
              height={40} 
              width={40} 
              className="rounded-full"
            />
            <div
              className={`w-[15px] h-[15px] rounded-full flex justify-center items-center absolute right-0 bottom-0 ${
                clicked ? "bg-[#4B6382]" : `bg-[#A68868]`
              }`}
              onClick={() => setClicked(!clicked)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <rect width="24" height="24" fill="none" />
                <path fill="#000" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z" />
              </svg>
            </div>
          </div>

          <Link href={isAdmin ? "Dashboard/Profile" :"/Setting/Account"} className="hidden 2xl:flex xl:text-lg">
            {profileData?.username || "User"}
          </Link>

          {clicked && <ProfileCard isAdmin={isAdmin} profile={profileData} />}
        </div>
      </div>
    </div>
  );
};

// Right Section for Unauthenticated Users
const RightSectionUnCon = () => {
  return (  
    <div className="w-full z-20 flex justify-end items-center">
      <div className="w-1/2 font-bold flex flex-row justify-evenly text-center items-center">
        <Link href={'/Log/Login'} className="w-full h-full rounded-md p-2">Login</Link>
        <Link href={'/Sign/Sign_up'} className="w-full h-full rounded-md p-2 text-black bg-white">Sign up</Link>
      </div>
    </div>
  );
};

// Main NavBar Component
export default function NavBar() {
  const { isAuthenticated  } = useAuth(); // Get user data
  const {formData} = useForm()
  const [clicked, setClicked] = useState(false);
  const path = usePathname(); // Always call usePathname

  const CenterSection = () => {
    return (
      <div className="w-full z-20 h-full p-0 flex justify-evenly items-center">
        <div className="flex justify-center items-center w-1/2 h-full">
          <Link href="/" aria-label="Home" className="w-1/2">
            <Image
              src={Logo}
              height={0}
              width={0}
              style={{ width: "", height: "" }}
              alt="Logo"
              priority={true}
            />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[90%] h-24 sticky left-[5%] top-[5%] bg-[var(--primary)] text-white flex px-10 flex-row z-50 rounded-full justify-between items-center shadow-[0_4px_4px_1px_rgba(0,0,0,0.3)]">
      <LeftSection path={path} />
      <CenterSection />
      {isAuthenticated ? (
        <RightSectionCon clicked={clicked} setClicked={setClicked} user={formData} />
      ) : (
        <RightSectionUnCon />
      )}
    </div>
  );
}
