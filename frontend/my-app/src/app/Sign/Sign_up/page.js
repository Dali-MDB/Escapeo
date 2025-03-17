"use client";
import { useState } from "react";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../../components/inputLogin";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook
import { useRouter } from "next/navigation";  // Import useRouter for redirection

export default function Sign_up() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const { setAuthenticated } = useAuth(); // Get the setAuthenticated function from the context
  const router = useRouter(); // Initialize the router

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value, // Update the specific field in the state
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/sign-up/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");
        setAuthenticated(true); // Set authenticated to true
        router.push("/Sign/Payment"); // Redirect to the payment page
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create account");
    }
  };

  return (
    <div className="w-3/4 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
      {/* Login Form */}
      <div className="w-full h-[80%] flex flex-col gap-10 justify-center items-center">
        {/* Header Section */}
        <div className="w-full flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Sign up</h1>
          <p>
            Let’s get you all set up so you can access your personal account.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-end gap-6 rounded-lg">
          <div className="w-full grid grid-cols-2 grid-rows-2 gap-4">
            {[
              { type: "text", name: "firstName", placeholder: "First Name" },
              { type: "text", name: "lastName", placeholder: "Last Name" },
              { type: "email", name: "email", placeholder: "Email" },
              { type: "text", name: "phoneNumber", placeholder: "Phone Number" },
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
          <div className="w-full grid grid-cols-1 grid-rows-2 gap-4">
            {[
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

          {/* Remember me & Forgot Password */}
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">
                I agree to all the{" "}
                <Link href="/Log/Login" className="text-[#ED881F] px-0">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/Log/Login" className="text-[#ED881F] px-0">
                  Privacy Policies
                </Link>
              </label>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full font-bold py-4 text-lg rounded-md bg-[#ED881F] text-black"
          >
            Create Account
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
    </div>
  );
}