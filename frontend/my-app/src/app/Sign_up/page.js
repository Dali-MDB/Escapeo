"use client";
import { useRef, useEffect } from "react";
import { FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../components/inputLogin";
import Link from "next/link";

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
        <div className="w-3/4 flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Sign up</h1>
          <p>
            Let’s get you all st up so you can access your personal account.
          </p>
        </div>

        {/* Login Form */}
        <form className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
          <div className="w-full grid grid-cols-2 grid-rows-2 gap-4">
            {[
              { type: "text", name: "First Name" },
              { type: "text", name: "Last Name" },
              { type: "email", name: "Email" },
              { type: "text", name: "Phone Number" },
            ].map((el, index) => (
              <InputLogin key={index} type={el.type} name={el.name} />
            ))}
          </div>
          <div className="w-full grid grid-cols-1 grid-rows-2 gap-4">
            {[
              { type: "password", name: "Password" },
              { type: "password", name: "Confirm Password" },
            ].map((el, index) => (
              <InputLogin key={index} type={el.type} name={el.name} />
            ))}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">
                I agree to all the{" "}
                <Link href="/Login" className="text-[#ED881F] px-0">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/Login" className="text-[#ED881F] px-0">
                  Privacy Policies
                </Link>
              </label>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full font-bold py-2 rounded-md bg-[#ED881F] text-black"
          ><Link href={"/Payment"}>
            Create Account</Link>
          </button>
        </form>

        {/* Sign-up Link */}
        <div className="w-3/4 text-center">
          <p>
            Already have an account?
            <Link href="/Login" className="text-[#ED881F] px-2">
              Login
            </Link>
          </p>
        </div>

        {/* Alternative Login */}
        <div className="w-3/4 flex items-center gap-2">
          <hr className="flex-grow border-gray-400" />
          <span className="text-sm">Or Sign up with</span>
          <hr className="flex-grow border-gray-400" />
        </div>

        {/* Social Login Buttons */}
        <div className="w-3/4 flex justify-center gap-4">
          {[
            {
              icon: <FaFacebook className="text-blue-600" />,
              label: "Facebook",
            },
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
