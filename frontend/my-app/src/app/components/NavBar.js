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
import { getMyProfile, logout } from "../utils/auth";
import { Heart } from "lucide-react";
import { Notifications, NotificationsActive } from "@mui/icons-material";
import { FaCircle } from "react-icons/fa";
const urbanist = Urbanist({ subsets: ["latin"], weight: "400" });
import { API_URL } from "../utils/constants";
import { useRouter } from "next/router";
// Left Section Component
const LeftSection = ({ path }) => {
  return (
    <div className="w-full z-20 h-full flex justify-start items-center">
      <div className="w-1/2 h-full flex flex-row justify-evenly gap-4 sm:gap-2 items-center">
        {navLinks.map(({ title, link, icon }, index) => (
          <div
            key={index}
            className={`z-30 flex flex-col justify-center h-full items-center relative ${path === link ? "shadow-[inset_0_-5px_white]" : ""
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
const RightSectionCon = ({ clicked, setClicked , isAuthenticated }) => {
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone_number: 0,
    address: null,
    date_of_birth: null,
    profile_picture: "", // Default image
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [count ,setCount] = useState(0)

  const fetchNotificationsUnreadCount = async () => {
    
    try {
        const response = await fetch(`${API_URL}/notifications/unread-count/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        if (response.ok) {
            const data = await response.json()

            console.log("fetch of unread count successful")
            setCount(data.unread_count)

        } else {
            throw new Error("error fetching unread notification count")
        }
    } catch (err) {
      logout()
    }

}

async function fetchProfile() {
  try {
    const response = await getMyProfile();
    if (response.success) {
      console.log(response.profile)
      const transformedData = {
        username: response.profile.user.username,
        profile_picture: response.profile.profile_picture !== "" ? response.profile.profile_picture : "/media/profile_pictures/profile.png",
      };
      setProfileData(transformedData);
      setIsAdmin(response.isAdmin);
    } else {
      setError(response.error);
    }
  } catch (err) {
    logout()
  } finally {
    setIsLoading(false);
  }
}

  useEffect(() => {

   
    if(isAuthenticated){
    
    fetchNotificationsUnreadCount()
    fetchProfile();
    }else{
      const router  = useRouter()
      router.push('/')
    }
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
      <div className="w-full sm:w-1/2 flex flex-row items-center">


        <div className="flex w-full items-center justify-end gap-3">
          {!isAdmin && <Link href='/Setting/Favourite' className="flex justify-between gap-x-2 items-center">
            {Heart && <Heart size={20} color="white" />}
            <span className="hidden 2xl:flex">Favorites</span>
          </Link>}
          <Link href='/Notification' className="flex relative justify-between gap-x-2 items-center">

            {
             
             
             count >0 &&
             <FaCircle size={10} color="var(--secondary)" className={`absolute top-0 right-0 `} />
              
            
            }
            
            <Notifications size={20} color="white" />
          </Link>

        </div>
        <div className="flex w-full cursor-pointer items-center justify-end gap-2 mx-2">
          <div className="flex overflow-hidden justify-around items-center relative">
            <div className="rounded-full overflow-hidden h-10 w-10">
              <Image width={150} height={150} alt="a" unoptimized src={`http://127.0.0.1:8000${profileData.profile_picture}`}
              /></div>
            <div
              className={`w-[15px] h-[15px] rounded-full flex justify-center items-center absolute right-0 bottom-0 ${clicked ? "bg-[#4B6382]" : `bg-[#A68868]`
                }`}
              onClick={() => setClicked(!clicked)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <rect width="24" height="24" fill="none" />
                <path fill="#000" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z" />
              </svg>
            </div>
          </div>

          <Link href={isAdmin ? "Dashboard/Profile" : "/Setting/Account"} className="hidden 2xl:flex xl:text-lg">
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
      <div className=" w-full lg:w-1/2 font-bold flex  sm:flex-row gap-2 sm:gap-0 justify-evenly items-center">
        <Link href={'/Log/Login'} className="w-full sm:w-auto px-4 py-2 rounded-md text-center">Login</Link>
        <Link href={'/Sign/Sign_up'} className="h-full sm:h-10 w-auto px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-base text-center text-black bg-white">Sign up</Link>
      </div>
    </div>
  );
};

// Main NavBar Component
export default function NavBar() {
  const { isAuthenticated } = useAuth(); // Get user data
  const { formData } = useForm()
  const [clicked, setClicked] = useState(false);
  const path = usePathname(); // Always call usePathname

  const CenterSection = () => {
    return (
      <div className="w-full z-20 h-full p-0 flex justify-evenly items-center">
        <div className="flex justify-center items-center w-3/4 sm:w-full h-full">
          <Link href="/" aria-label="Home" className="w-full sm:w-1/2">
            <Image
              src={"/logo.png"}
              height={256}
              width={256}
              style={{ width: "", height: "" }}
              alt="Logo"
              priority={true}
              unoptimized
            />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[90%] h-14 sm:h-24 sticky left-[5%]  top-[1%] sm:top-[5%] bg-[var(--primary)] text-white flex px-10 flex-row z-50 rounded-full justify-between items-center shadow-[0_4px_4px_1px_rgba(0,0,0,0.3)]">
      <LeftSection path={path} />
      <CenterSection />
      {isAuthenticated ? (
        <RightSectionCon clicked={clicked} isAuthenticated={isAuthenticated} setClicked={setClicked} user={formData} />
      ) : (
        <RightSectionUnCon />
      )}
    </div>
  );
}
