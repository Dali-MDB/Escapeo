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
      <div className="w-3/6 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
        {/* Header Section */}
        <div className="w-3/4">
        <Link href={'/Login'} className="w-1/2 flex items-center gap-2 text-lg font-bold">{arrowBack} Back to Login</Link>
        </div>
      
        <div className="w-3/4 flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Verify  code</h1>
          <p>An authentication code has been sent to your email.</p>
        </div>

        {/* Login Form */}
        <form className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
          <InputLogin type="text" name="Enter Code" />
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <label htmlFor="remember">
              Didn’t receive a code?{" "}
                <Link href="/Login" className="text-[#ED881F] px-0">
                Resend
                </Link>{" "}
              </label>
            </div>
          </div>
          <button type="submit" className="w-full font-bold py-3 rounded-md bg-[#ED881F] text-black">
            Verify
          </button>
        </form>

        {/* Sign-up Link */}


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