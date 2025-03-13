"use client";
import { useState } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const InputLogin = ({ type, name }) => {
  const [filled, setFilled] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <StyledWrapper className="w-full">
      <div className="input-container">
        {type === "text-area"?
        <textarea 
         id={name}
        className={`input ${filled ? "filled" : ""} focus:border-none active:border-none focus:outline-none active:outline-none bg-transparent`}
        onChange={(e) => setFilled(e.target.value !== "")}
        onBlur={(e) => setFilled(e.target.value !== "")}
        required
        rows={5}

       />
        :
        <input
          type={type === "password" && !showPassword ? "password" : "text"} // Toggle input type
          id={name}
          className={`input ${filled ? "filled" : ""}`}
          onChange={(e) => setFilled(e.target.value !== "")}
          onBlur={(e) => setFilled(e.target.value !== "")}
          required
        />
        }<label htmlFor={name} className={`label ${type === "text-area" ? "top-5" : "top-[50%]" }`}>
          {name}
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
    transition: border-color 0.2s ease-in-out;
  }

  .label {
    position: absolute;
    left: 12px;
    transform: translateY(-50%);
    background-color: #eedac4;
    padding: 0 5px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.6);
    transition: all 0.2s ease-in-out;
  }

  .textarea:focus, .input:focus {
    border-color: #ed881f;
  }
  , textarea:active{
  border:none;
  outline-none;
   }
  .input:focus ~ .label,
  .input.filled ~ .label {
    top: 0;
    font-size: 14px;
    color: #ed881f;
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