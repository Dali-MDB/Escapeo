"use client";
import { useRef, useEffect } from "react";
import { FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../../components/inputLogin";
import Link from "next/link";
import { arrowBack } from "../../data/data";
export default function Forgot() {
  const scrollRef = useRef(null);
  const images = ["/coverLogin1.png", "/coverLogin2.jpg"];

 
  return (
    <div className="w-3/4 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
        {/* Header Section */}
        <div className="w-full">
        <Link href={'/Login'} className="w-1/2 flex items-center gap-2 text-lg font-bold">{arrowBack} Back to Login</Link>
        </div>
      
        <div className="w-full flex flex-col justify-center items-start gap-6">
          <h1 className="text-black text-4xl font-bold">Forgot your password?</h1>
          <p>Don’t worry, happens to all of us. Enter your email below to recover your password</p>
        </div>

        {/* Login Form */}
        <form className="w-full flex flex-col items-end gap-8 rounded-lg">
          <InputLogin type="email" name="Email" />
          {/* Remember me & Forgot Password */}
        
          {/* Login Button */}
          <button type="submit" className="w-full font-bold py-4 text-lg rounded-md bg-[var(--secondary)] text-black">
            <Link href={'/Log/Verify'}>Submit</Link>
          </button>
        </form>

        

        {/* Alternative Login */}
        <div className="w-full flex items-center gap-2">
          <hr className="flex-grow border-gray-400" />
          <span className="text-sm">Or Login with</span>
          <hr className="flex-grow border-gray-400" />
        </div>

        {/* Social Login Buttons */}
        <div className="w-full flex justify-center gap-4">
          {[
            { icon: <FaFacebook className="text-blue-600" />, label: "Facebook" },
            { icon: <FcGoogle />, label: "Google" },
            { icon: <FaApple className="text-black" />, label: "Apple" },
          ].map((item, index) => (
            <button
              key={index}
              className="flex items-center justify-center gap-2 border-2 border-[var(--secondary)] w-full px-5 py-4 text-xl rounded-md text-black font-medium hover:text-white transition"
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
  );
}