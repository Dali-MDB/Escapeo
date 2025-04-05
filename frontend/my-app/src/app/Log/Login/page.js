"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../../components/inputLogin";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import { useForm } from "../../context/FormContext"; // Import useForm
import { getMyProfile, login } from "../../utils/auth"; // Import the login function

export default function Login() {
  const { loginData, setLoginData } = useForm(); // Use form context
  const { setIsAuthenticated } = useAuth(); // Use auth context
  const router = useRouter(); // Initialize router
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [isLoading, setIsLoading] = useState(false); // State for loading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
  
    const payload = {
      username: loginData.email, // or email: loginData.email depending on your backend
      password: loginData.password,
    };
  
    try {
      // 1. First attempt login
      const loginResponse = await login(payload.username, payload.password);
      
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }
  
      // 2. If login successful, get profile
      const profileResponse = await getMyProfile();
      
      if (!profileResponse.ok) {
        
        console.log(profileResponse || "Failed to fetch profile");
      }
  
      
      setIsAuthenticated(true);
      alert("Login successful!");
      router.push('/')
      
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-3/4 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
      {/* Header Section */}
      <div className="w-full flex flex-col justify-center items-start gap-4">
        <h1 className="text-black text-4xl font-bold">Login</h1>
        <p>Login to access your Golobe account</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full flex flex-col items-end gap-6 rounded-lg">
        {/* Email Input */}
        <InputLogin
          type="email"
          name="email"
          placeholder="Email"
          value={loginData.email}
          onChange={handleChange}
        />

        {/* Password Input */}
        <InputLogin
          type="password"
          name="password"
          placeholder="Password"
          value={loginData.password}
          onChange={handleChange}
        />

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-600 w-full text-left">{errorMessage}</p>
        )}

        {/* Remember Me and Forgot Password */}
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-2">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <Link href="/Log/Forgot" className="text-[#ED881F] text-sm">
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full text-lg font-bold py-4 rounded-md bg-[#ED881F] text-white"
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Sign-up Link */}
      <div className="w-full text-center">
        <p>
          Don't have an account?
          <Link href="/Sign_up" className="text-[#ED881F] px-2">
            Sign up
          </Link>
        </p>
      </div>

      {/* Social Login Section */}
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
            className="flex items-center justify-center gap-2 border-2 border-[#ED881F] w-full px-5 py-4 text-xl rounded-md text-black font-medium hover:bg-[#ED881F] hover:text-white transition"
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
}