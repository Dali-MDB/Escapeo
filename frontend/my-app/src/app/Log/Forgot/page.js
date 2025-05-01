"use client";
import { useState } from "react";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../../components/inputLogin";
import Link from "next/link";
import { arrowBack } from "../../data/data";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/utils/constants";

export default function Forgot() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/profiles/password_reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reset code");
      }

      // Redirect to verification page without query params
      router.push('/Log/Verify');
    } catch (err) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-3/4 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
      {/* Header Section */}
      <div className="w-full">
        <Link href={'/Login'} className="w-1/2 flex items-center gap-2 text-lg font-bold">
          {arrowBack} Back to Login
        </Link>
      </div>
      
      <div className="w-full flex flex-col justify-center items-start gap-6">
        <h1 className="text-black text-4xl font-bold">Forgot your password?</h1>
        <p>Don't worry, happens to all of us. Enter your email below to recover your password</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-end gap-8 rounded-lg">
        <InputLogin 
          type="email" 
          name="email"
          placeholder="Email"
          register={register}
          validation={{ 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          }}
          error={errors.email}
        />
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full font-bold py-4 text-lg rounded-md bg-[var(--secondary)] text-black disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Submit"}
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
            type="button"
            className="flex items-center justify-center gap-2 border-2 border-[var(--secondary)] w-full px-5 py-4 text-xl rounded-md text-black font-medium hover:text-white transition"
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
}