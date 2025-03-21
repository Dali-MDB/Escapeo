"use client";
import { useRef, useEffect } from "react";
import { FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../components/inputLogin";
import Link from "next/link";

export default function ContactForm() {
  const scrollRef = useRef(null);
  const images = ["/contactFormImg.png"];

  // Auto-scroll effect
  return (
    <div className="w-screen h-screen text-black bg-[#EEDAC4] flex flex-row-reverse justify-center items-center gap-0">
      {/* Login Form */}
      <div className="w-2/5 h-[80%] gap-10 flex flex-col  justify-center items-center">
        {/* Header Section */}
        <div className="w-3/4 flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Get In Touch</h1>
          <p>
            Let us hear from you
          </p>
        </div>

        {/* Login Form */}
        <form className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
          <div className="w-full grid grid-cols-2 grid-rows-1 gap-4">
            {[
              { type: "text", name: "First Name" },
              { type: "text", name: "Last Name" },
            ].map((el, index) => (
              <InputLogin key={index} type={el.type} name={el.name} />
            ))}
          </div>
          <div className="w-full grid grid-cols-1 grid-rows-2 gap-4">
            {[
              { type: "text", name: "Company Name" },
              { type: "email", name: "Email" },
            ].map((el, index) => (
              <InputLogin key={index} type={el.type} name={el.name} />
            ))}
          </div>
          <div className="w-full grid grid-cols-1  grid-rows-1 h-full">
          {[
              { type: "text-area", name: "Enter Your message" },
            ].map((el, index) => (
              <InputLogin key={index} type={el.type} name={el.name} />
            ))}
          </div>

          {/* Remember me & Forgot Password */}
         

          {/* Login Button */}
          <button
            type="submit"
            className="w-full font-bold py-2 rounded-md bg-[#ED881F] text-black"
          >
            Send Message
          </button>
          <div className="w-full text-center text-xs "> <p className="w-[75%] mx-auto">
          By confirming your subscription, you allow The Outdoor Inn Crowd Limited to charge your card for this payment and future payments in accordance with their terms. You can always cancel your subscription.
          </p></div>
          </form>

      </div>

      {/* Image Scroller */}
      <div className="w-2/5 h-[80%] flex justify-center items-center">
        <div
          className="w-2/3 h-full flex rounded-3xl"
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 bg-cover bg-center rounded-3xl"
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
