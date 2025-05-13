"use client";
import React, { useState } from 'react';

const CustomDropdown = ({ name, options, selectedValue, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || '';

  return (
    <div className="w-full">
      <div className={`relative w-full ${isOpen ? 'z-10' : ''}`}>
        <div
          className={`flex items-center justify-between w-full min-h-[50px] px-3 py-2 bg-[var(--bg-color)] border border-[var(--secondary)] rounded-xl cursor-pointer ${isOpen ? 'border-[var(--bg-color)]' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-col relative w-full">
            <span className={`absolute left-0 -translate-y-[30%] top-0 transform   bg-[var(--bg-color)] px-1 text-xl transition-all duration-200 ease-in-out pointer-events-none ${isOpen || selectedLabel
                ? 'top-0 text-[14px] text-[var(--secondary)] -translate-y-[90%]'
                : 'text-base text-gray-600'
              }`}>
              {placeholder}
            </span>
            <span className="mt-2 block text-gray-700">{selectedLabel}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute w-full mt-1 bg-[var(--bg-color)] rounded-lg shadow-lg border border-gray-200 max-h-[200px] overflow-y-auto z-20">
            {options.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${'hover:bg-[#235784] hover:text-[var(--bg-color)]'
                  }`}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomDropdown;