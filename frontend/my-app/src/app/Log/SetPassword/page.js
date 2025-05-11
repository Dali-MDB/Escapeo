"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import InputLogin from "../../components/inputLogin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {login} from "@/app/utils/auth"
export default function SetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedMail = localStorage.getItem('data');
    if (storedMail) {
      setEmail(storedMail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== cpassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      // 1. First confirm the password reset
      const resetResponse = await fetch(`http://127.0.0.1:8000/profiles/password_reset_confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          new_password: password,
          email: email
        })
      });

      if (!resetResponse.ok) {
        const errorData = await resetResponse.json();
        throw new Error(errorData.message || "Failed to reset password");
      }

      // 2. Automatically log the user in with new credentials
      const loginResponse = await login(email, password);
      
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.message || "Login failed after password reset");
      }

      // 3. On successful login, redirect to dashboard/home
      router.push('/'); // Change to your desired post-login route
      
    } catch (err) {
      setError(err.message || "An error occurred during password reset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-3/4 flex flex-col justify-center items-start gap-4">
        <h1 className="text-black text-4xl font-bold">Verify code</h1>
        <p>An authentication code has been sent to your email.</p>
      </div>

      {error && (
        <div className="w-3/4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
        <InputLogin 
          type="text" 
          name={"code"} 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          placeholder="Enter Code" 
          required
        />
        
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-2">
            <label htmlFor="remember">
              Didn't receive a code?{" "}
              <Link href="/Login" className="text-[var(--secondary)] px-0">
                Resend
              </Link>
            </label>
          </div>
        </div>

        <div className="relative w-full">
          <InputLogin 
            placeholder={"New Password"} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type={showPassword ? "text" : "password"} 
            name="New Password" 
            required
            minLength={8}
          />
          <button
            type="button"
            className="absolute right-3 top-4 text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative w-full">
          <InputLogin 
            placeholder={"Confirm New Password"} 
            value={cpassword} 
            onChange={(e) => setCpassword(e.target.value)} 
            type={showConfirmPassword ? "text" : "password"} 
            name="Confirm Password" 
            required
            minLength={8}
          />
          <button
            type="button"
            className="absolute right-3 top-4 text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full font-bold py-2 rounded-md bg-[var(--secondary)] text-white disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Reset Password"}
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