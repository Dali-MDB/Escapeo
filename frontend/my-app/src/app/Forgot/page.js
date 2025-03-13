"use client";
import { useRef, useEffect } from "react";
import { FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../components/inputLogin";
import Link from "next/link";
import { arrowBack } from "../data/data";
export default function Forgot() {
  const scrollRef = useRef(null);
  const images = ["/coverLogin1.png", "/coverLogin2.jpg"];

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: container.clientWidth, behavior: "smooth" });
        }
      }
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen text-black bg-[#EEDAC4] flex justify-center items-center gap-10">
      {/* Login Form */}
      <div className="w-3/6 h-[80%] flex flex-col gap-10 justify-center items-center">
        {/* Header Section */}
        <div className="w-3/4">
        <Link href={'/Login'} className="w-1/2 flex items-center gap-2 text-lg font-bold">{arrowBack} Back to Login</Link>
        </div>
      
        <div className="w-3/4 flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Forgot your password?</h1>
          <p>Don’t worry, happens to all of us. Enter your email below to recover your password</p>
        </div>

        {/* Login Form */}
        <form className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
          <InputLogin type="email" name="Email" />
          {/* Remember me & Forgot Password */}
        
          {/* Login Button */}
          <button type="submit" className="w-full font-bold py-3 rounded-md bg-[#ED881F] text-black">
            <Link href={'/Verify'}>Submit</Link>
          </button>
        </form>

        {/* Sign-up Link */}


        {/* Alternative Login */}
        <div className="w-3/4 flex items-center gap-2">
          <hr className="flex-grow border-gray-400" />
          <span className="text-sm">Or Login with</span>
          <hr className="flex-grow border-gray-400" />
        </div>

        {/* Social Login Buttons */}
        <div className="w-3/4 flex justify-center gap-4">
          {[
            { icon: <FaFacebook className="text-blue-600" />, label: "Facebook" },
            { icon: <FcGoogle />, label: "Google" },
            { icon: <FaApple className="text-black" />, label: "Apple" },
          ].map((item, index) => (
            <button
              key={index}
              className="flex items-center justify-center gap-2 border-2 border-[#ED881F] w-full px-5 py-4 text-xl rounded-md text-black font-medium hover:text-white transition"
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Image Scroller */}
      <div className="w-1/2 h-[80%] flex justify-center items-center">
        <div
          ref={scrollRef}
          className="w-3/4 h-full flex no-scrollbar overflow-x-scroll scroll-smooth snap-x snap-mandatory rounded-3xl"
          style={{ scrollBehavior: "smooth" }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 bg-cover bg-center snap-start"
              style={{
                backgroundImage: `url(${img})`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}