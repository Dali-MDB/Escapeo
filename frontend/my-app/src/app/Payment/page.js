"use client";
import { useRef, useEffect } from "react";
import { FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../components/inputLogin";
import Link from "next/link";
import { arrowBack } from "../data/data";


export default function Sign_up() {
  const scrollRef = useRef(null);
  const images = ["/coverLogin1.png", "/coverLogin2.jpg"];

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        if (
          container.scrollLeft + container.clientWidth >=
          container.scrollWidth
        ) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({
            left: container.clientWidth,
            behavior: "smooth",
          });
        }
      }
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen text-black bg-[#EEDAC4] flex flex-row-reverse justify-center items-center gap-10">
      {/* Login Form */}
      <div className="w-3/5 h-[80%] flex flex-col gap-10 justify-center items-center">
        {/* Header Section */}
        <div className="w-3/4">
        <Link href={'/Sign_up'} className="w-1/2 flex items-center gap-2 text-lg font-bold">{arrowBack}Go Back</Link>
        </div>
        <div className="w-3/4 flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Add a payment method</h1>
          <p>Let’s get you all st up so you can access your personal account.
          </p>
        </div>

        {/* Login Form */}
        <form className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
          
          <div className="w-full">
          <InputLogin  type={"text"} name={"Card Number"} />
            
          </div>
          <div className="w-full grid grid-cols-2 grid-rows-1 gap-4">
            {[
              { type: "text", name: "Exp. Date" },
              { type: "text", name: "CVC" },
            ].map((el, index) => (
              <InputLogin key={index} type={el.type} name={el.name} />
            ))}
          </div>
          <div className="w-full grid grid-cols-1 grid-rows-2 gap-4">
            {[
              { type: "text", name: "Name on Card" },
              { type: "password", name: "Country or Region" },
            ].map((el, index) => (
              <InputLogin key={index} type={el.type} name={el.name} />
            ))}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">
              Securely save my information for 1-click checkout
              </label>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full font-bold py-2 rounded-md bg-[#ED881F] text-black"
          >
            Create Account
          </button>
          <div className="w-full text-center text-xs "> <p className="w-[70%] mx-auto">
          By confirming your subscription, you allow The Outdoor Inn Crowd Limited to charge your card for this payment and future payments in accordance with their terms. You can always cancel your subscription.
          </p></div>
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
