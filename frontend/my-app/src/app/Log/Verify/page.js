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
        <div className="w-3/4">
        <Link href={'/Log/Login'} className="w-1/2 flex items-center gap-2 text-md font-bold">{arrowBack} Back to Login</Link>
        </div>
      
        <div className="w-3/4 flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Verify  code</h1>
          <p>An authentication code has been sent to your email.</p>
        </div>

        <form className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
          <InputLogin type="text" name="Enter Code" />
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <label htmlFor="remember">
              Didn’t receive a code?{" "}
                <Link href="/Login" className="text-[var(--secondary)] px-0">
                Resend
                </Link>{" "}
              </label>
            </div>
          </div>
          <button type="submit" className="w-full text-lg font-bold py-4 rounded-md bg-[var(--secondary)] text-black">
            Verify
          </button>
        </form>

    
     

      
      </div>
  );
}