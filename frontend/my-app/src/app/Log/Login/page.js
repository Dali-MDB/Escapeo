"use client";
import { useState } from "react";
import { FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../../components/inputLogin";
import Link from "next/link";

export default function Login() {
  return (  
  <div className="w-3/4 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
    
      <div className="w-full flex flex-col justify-center items-start gap-4">
        <h1 className="text-black text-4xl font-bold">Login</h1>
        <p>Login to access your Golobe account</p>
      </div>

      <form className="w-full flex flex-col items-end gap-6 rounded-lg">
        <InputLogin type="email" name="Email" />
        <InputLogin type="password" name="Password" />

        <div className="w-full flex justify-between items-center">
          <div className="flex gap-2">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <Link href="/Log/Forgot" className="text-[#ED881F] text-sm">Forgot Password?</Link>
        </div>

        <button type="submit" className="w-full text-lg font-bold py-4 rounded-md bg-[#ED881F] text-white">
          Login
        </button>
      </form>

      <div className="w-full text-center">
        <p>
          Don't have an account?
          <Link href="/Sign_up" className="text-[#ED881F] px-2">Sign up</Link>
        </p>
      </div>

      <div className="w-full flex items-center gap-2">
        <hr className="flex-grow border-gray-400" />
        <span className="text-sm">Or Login with</span>
        <hr className="flex-grow border-gray-400" />
      </div>

      <div className="w-full flex justify-center gap-4">
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
  );
}
