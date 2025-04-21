"use client";
import React, { useState } from 'react';
import styled from 'styled-components';

const CustomDropdown = ({ name, options, selectedValue, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value) => {
    onChange({
      target: {
        name: name,
        value: value
      }
    });
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || '';

  return (
    <StyledWrapper>
      <div className={`select rounded-lg ${isOpen ? 'open' : ''}`}>
        <div 
          className="selected rounded-lg" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <label className={`label ${selectedValue || isOpen ? 'active' : ''}`}>
            {placeholder}
          </label>
          <span className="selected-value">{selectedLabel}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512"
            className={`arrow ${isOpen ? 'rotate' : ''}`}
          >
            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
          </svg>
        </div>
        {isOpen && (
          <div className="options rounded-lg">
            {options.map((option) => (
              <div
                key={option.value}
                className={`option ${selectedValue === option.value ? 'selected-option' : ''}`}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .select {
    width: 100%;
    cursor: pointer;
    position: relative;
    color: black;
    margin-top: 10px;
  }

  .selected {
    background-color: [var(--bg-color)];
    padding: 14px 12px 6px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.7);
    position: relative;
    min-height: 50px;
  }

  .selected-value {
    margin-top: 8px;
    display: block;
  }

  .label {
    position: absolute;
    left: 12px;
    top: 0%;
    transform: translateY(-50%);
    background-color: [var(--bg-color)];
    padding: 0 5px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.6);
    transition: all 0.2s ease-in-out;
    pointer-events: none;
  }

  .label.active {
    top: 0;
    font-size: 14px;
    color: [var(--secondary)];
    transform: translateY(-50%);
  }

   .options {
    position: absolute;
    width: 100%;
    background-color: [var(--bg-color)];
    border-radius: 5px;
    margin-top: 5px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
    color: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
  }

  .option {
    padding: 12px 15px;
    transition: all 0.2s ease;
    font-size: 15px;
    
    &:hover {
      background-color: #235784;
      color: [var(--bg-color)];
    }
  }

  .selected-option {
    background-color: [var(--bg-color)];
  }

  .select.open .selected {
    border-color: [var(--bg-color)];
  }

  /* Rest of your styles remain the same */
  /* ... */
`;

export default CustomDropdown;