"use client";
import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const InputLogin = ({ min, max, type, name, value, onChange, placeholder, error, className, required, backgroundColor, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    setIsFilled(!!value);
  }, [value]);

  const handleChange = (e) => {
    onChange && onChange(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const inputType = useMemo(() => {
    if (type === "password") return showPassword ? "text" : "password";
    return type; // Let the browser handle native types like date, email, etc.
  }, [type, showPassword]);

  return (
    <StyledWrapper className={`w-full ${className}`} $backgroundColor={backgroundColor}>
      <div className={`input-container ${error ? "has-error" : ""}`}>
        {type === "text-area" ? (
          <textarea
            id={name}
            className={`input ${isFilled ? "filled" : ""} ${error ? "error" : ""}`}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            name={name}
            required={required}
            rows={4}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        ) : (
          <input
            type={inputType === 'email' ? 'text' : inputType}
            id={name}
            className={`input ${isFilled ? "filled" : ""} ${error ? "error" : ""}`}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            name={name}
            required={required}
            min={min}
            max={max}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        )}
        <label
          htmlFor={name}
          className={`label ${type === "text-area" ? "label-textarea" : ""} ${isFocused ? "focused" : ""}`}
        >
          {placeholder}
        </label>
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="eye-button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1} // Prevent button from being in tab sequence
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
        {error && (
          <span id={`${name}-error`} className="error-message">{error}</span>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .input-container {
    position: relative;
    width: 100%;
    margin-bottom: 1rem;

    &.has-error {
      .input {
        border-color: #ff4444;
      }
      .label {
        color: #ff4444;
      }
    }
  }

  .input {
    width: 100%;
    padding: 14px 12px 6px;
    font-size: 16px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    background: transparent;
    outline: none;
    transition: all 0.2s ease-in-out;
    background-color: #eeeeee;
    &:focus {
      border-color: var(--secondary);
    }
    
    &.error {
      border-color: #ff4444;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .label {
    position: absolute;
    text-align: center;
    left: 12px;
    top: 55%;
    transform: translateY(-50%);
    padding: 3px 5px;
    font-size: 16px;
    color: hsl(31, 85%, 53%);
    transition: all 0.2s ease-in-out;
    pointer-events: none;
    background-color: #eeeeee;
    min-width: 100px;
    border-radius: 8px;
    &.focused {
      color: var(--secondary);
    }
    
    &.label-textarea {
      top: 20px;
    }
  }

  .input:focus ~ .label,
  .input.filled ~ .label {
    top: 0;
    font-size: 14px;
    color: var(--secondary);

    border: 1px solid var(--secondary);
  }

  .input.filled:not(:focus) ~ .label {
    color: hsl(31, 85%, 53%);
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
    
    &:hover {
      color: var(--secondary);
    }

    &:focus-visible {
      outline: 2px solid var(--secondary);
      outline-offset: 2px;
    }
  }

  .error-message {
    display: block;
    color: #ff4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    padding-left: 0.5rem;
  }
`;

export default InputLogin;