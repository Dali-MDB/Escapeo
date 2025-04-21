"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import InputLogin from "../../components/inputLogin";
import Link from "next/link";

export default function SetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="w-3/4 flex flex-col justify-center items-start gap-4">
        <h1 className="text-black text-4xl font-bold">Set New Password</h1>
        <p>Please enter a new password for your account</p>
      </div>

      <form className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
        <div className="relative w-full">
          <InputLogin type={showPassword ? "text" : "password"} name="New Password" />
          <button
            type="button"
            className="absolute right-3 top-4 text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative w-full">
          <InputLogin type={showConfirmPassword ? "text" : "password"} name="Confirm Password" />
          <button
            type="button"
            className="absolute right-3 top-4 text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button type="submit" className="w-full font-bold py-2 rounded-md bg-[var(--secondary)] text-white">
          Reset Password
        </button>
      </form>

      <div className="w-3/4 text-center">
        <p>
          Remember your password?
          <Link href="/Login" className="text-[var(--secondary)] px-2">Login</Link>
        </p>
      </div>
    </>
  );
}
