"use client";  
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "../../context/FormContext";
import { useAuth } from "../../context/AuthContext";
import { signUp } from "../../utils/auth";
import InputLogin from "@/app/components/inputLogin";
import Link from "next/link";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function Sign_up() {
  const { formData, setFormData } = useForm();
  const { setIsAuthenticated } = useAuth();
  const router = useRouter();
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const handleNext = (e) => {

    e.preventDefault();
    if (formData.confirm_password && formData.password !== formData.confirm_password) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
      router.push("/Sign/more-info");
 
    }
  
  
   };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      if (value.length < 8) {
        setPasswordError("Password must be at least 8 characters.");
      } else if (!/[A-Z]/.test(value)) {
        setPasswordError(
          "Password must include at least one uppercase letter."
        );
      } else if (!/\d/.test(value)) {
        setPasswordError("Password must include at least one number.");
      } else {
        setPasswordError("");
      }
    }

    // Clear confirm password error when either password changes
    
  };


  return (
    <div className="w-3/4 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
      {/* Login Form */}
      <div className="w-full h-[80%] flex flex-col gap-10 justify-center items-center">
        {/* Header Section */}
        <div className="w-full flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Sign up</h1>
          <p>
            Let's get you all set up so you can access your personal account.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleNext}
          className="w-full flex flex-col items-end gap-6 rounded-lg"
          encType="multipart/form-data"
        >
          {formError && (
            <div className="w-full text-red-500 text-sm">{formError}</div>
          )}
          
          <div className="w-full grid grid-cols-1 grid-rows-1">
            <InputLogin
              type="text"
              name="username"
              placeholder="User Name"
              value={formData.username || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full grid grid-cols-2 grid-rows-1 gap-4">
            {[
              { type: "email", name: "email", placeholder: "Email" },
              {
                type: "text",
                name: "phone_number",
                placeholder: "Phone Number",
              },
            ].map((el, index) => (
              <InputLogin
                key={index}
                type={el.type}
                name={el.name}
                placeholder={el.placeholder}
                value={formData[el.name] || ""}
                onChange={handleChange}
                required
              />
            ))}
          </div>
          <div className="w-full grid grid-cols-1 grid-rows-2 gap-4">
            {[
              { type: "password", name: "password", placeholder: "Password" },
              {
                type: "password",
                name: "confirm_password",
                placeholder: "Confirm Password",
              },
            ].map((el, index) => (
              <div key={index}>
                <InputLogin
                  type={el.type}
                  name={el.name}
                  placeholder={el.placeholder}
                  value={formData[el.name] || ""}
                  onChange={handleChange}
                  required
                />
                {index === 0 && passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full font-bold py-4 text-lg rounded-md ${
              passwordError || !formData.password || !formData.confirm_password || formData.password !== formData.confirm_password
                ? "bg-gray-400"
                : "bg-[#ED881F]"
            } text-black`}
            disabled={
              passwordError || !formData.password || !formData.confirm_password || formData.password !== formData.confirm_password
            }
          >
            Next
          </button>
        </form>

        {/* Rest of your component remains the same */}
        {/* Sign-up Link */}
        <div className="w-full text-center">
          <p>
            Already have an account?
            <Link
              href="/Log/Login"
              className="text-[#ED881F] px-2 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Alternative Login */}
        <div className="w-full flex items-center gap-2">
          <hr className="flex-grow border-gray-400" />
          <span className="text-sm">Or Sign up with</span>
          <hr className="flex-grow border-gray-400" />
        </div>

        {/* Social Login Buttons */}
        <div className="w-full flex justify-center gap-4">
          {[
            {
              icon: <FaFacebook className="text-blue-600" />,
              label: "Facebook",
              provider: "facebook",
            },
            { icon: <FcGoogle />, label: "Google", provider: "google" },
            {
              icon: <FaApple className="text-black" />,
              label: "Apple",
              provider: "apple",
            },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => handleSocialLogin(item.provider)}
              className="flex items-center justify-center gap-2 border-2 border-[#ED881F] w-full px-5 py-4 text-xl rounded-md text-black font-medium hover:bg-[#ED881F] hover:text-white transition"
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}