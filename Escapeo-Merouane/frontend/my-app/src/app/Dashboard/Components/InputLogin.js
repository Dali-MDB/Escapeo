"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const InputLogin = ({ type, name, value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [isFilled, setIsFilled] = useState(false); // State to track if the input is filled

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Update isFilled state when the value changes
  useEffect(() => {
    setIsFilled(!!value);
  }, [value]);

  return (
    <StyledWrapper className="w-full">
      <div className="input-container">
        {type === "text-area" ? (
          <textarea
            id={name}
            className={`input bg-transparent ${isFilled ? "filled" : ""}`}
            onChange={(e) => {
              onChange(e); // Pass the event to the parent
            }}
            required
            rows={5}
            value={value}
            name={name} // Ensure the name attribute is set
          />
        ) :
        
        ( <>    
        
          <input
            type={type === "password" && !showPassword ? "password" : type} // Toggle input type
            id={name}
            className={` input   ${isFilled ? "filled" : ""}`}
            onChange={(e) => {
              onChange(e); // Pass the event to the parent
            }}
            required
            value={value}
            name={name} // Ensure the name attribute is set
          /></>
        )}
       <label htmlFor={name} className={` label  ${type === "text-area" ? "top-5" : type === "date" ? "top-2" : "top-[50%]"}`}>
          {placeholder}
        </label>
        {type === "password" && ( // Show toggle button only for password fields
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="eye-button"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .input-container {
    position: relative;
    width: 100%;
  }

  .input {
    width: 100%;
    padding: 14px 12px 6px;
    font-size: 16px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    background: transparent;
    outline: none;
    color:#FEF8F5;
    transition: border-color 0.2s ease-in-out;
  }

  .label {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #FEF8F5;
    padding: 0 5px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.6);
    transition: all 0.2s ease-in-out;
    pointer-events: none; /* Ensure the label doesn't interfere with input clicks */
  }

  .date-label {
    position: absolute;
    left: 12px;
    top:-30%;
    background-color: #FEF8F5;
    padding: 3px 5px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.6);
    transition: all 0.2s ease-in-out;
    pointer-events: none; /* Ensure the label doesn't interfere with input clicks */
  }

  .input:focus ~ .label,
  .input.filled ~ .label,
   {
    top: 0;
    font-size: 14px;
    color: #ed881f;
 
  }

  .input:focus {
    border-color: #ed881f;
    color:rgba(0,0,0,0.8)
  }
  .input.filled{
  color:rgba(0,0,0,0.8)
  }

  .eye-button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.6);
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .eye-button:hover {
    color: #ed881f;
  }
`;

export default InputLogin;