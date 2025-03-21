
// app/sign/page.js
"use client";
import { useState } from "react";
import InputLogin from "../../components/inputLogin";
import Link from "next/link";
import { useForm } from "../../context/FormContext"; // Import the useForm hook
import { useRouter } from "next/navigation";  // Import useRouter for redirection

export default function Sign_up() {
  const { formData, setFormData } = useForm(); // Use the form context
  const router = useRouter(); // Initialize the router

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value, // Update the specific field in the state
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    // Validate form data if needed
    router.push("/sign/more-info"); // Navigate to the "more info" page
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 justify-center items-center">
      {/* Header Section */}
      <div className="w-full flex flex-col justify-center items-start gap-4">
        <h1 className="text-black text-4xl font-bold">Sign up</h1>
        <p>
          Let’s get you all set up so you can access your personal account.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleNext} className="w-full flex flex-col items-end gap-6 rounded-lg">
        <div className="w-full grid grid-cols-2 grid-rows-2 gap-4">
          {[
            { type: "text", name: "username", placeholder: "Username" },
            { type: "email", name: "email", placeholder: "Email" },
            { type: "text", name: "phone_number", placeholder: "Phone Number" },
            { type: "password", name: "password", placeholder: "Password" },
            { type: "password", name: "confirmPassword", placeholder: "Confirm Password" },
          ].map((el, index) => (
            <InputLogin
              key={index}
              type={el.type}
              name={el.name}
              placeholder={el.placeholder}
              value={formData[el.name]}
              onChange={handleChange}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          type="submit"
          className="w-full font-bold py-4 text-lg rounded-md bg-[#ED881F] text-black"
        >
          Next
        </button>
      </form>

      {/* Sign-up Link */}
      <div className="w-full text-center">
        <p>
          Already have an account?
          <Link href="/Log/Login" className="text-[#ED881F] px-2">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}