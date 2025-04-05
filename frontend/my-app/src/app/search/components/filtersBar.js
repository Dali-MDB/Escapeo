"use client";

import { useSearch } from "@/app/context/SearchContext";
import { useState } from "react";
import { arrowIconDown, arrowIconUp } from "@/app/data/data";

const FilterEl = ({ filterTitle, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full flex flex-col py-4 border-b border-gray-200 last:border-0">
      <div className="w-full flex justify-between items-center text-xl">
        {filterTitle}
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="p-1 focus:outline-none transition-transform duration-200"
        >
          {open ? arrowIconUp : arrowIconDown}
        </button>
      </div>
      {open && <div className="pt-3 animate-fadeIn">{content}</div>}
    </div>
  );
};

const RatingButton = ({ rate, active, onClick }) => {
  return (
    <button
      onClick={() => onClick(rate)}
      className={`p-2 px-4 w-10 h-10 flex items-center justify-center border-2 rounded-md transition-colors duration-200 ${
        active
          ? "bg-orange-500 border-orange-500 text-white"
          : "bg-transparent border-orange-300 text-black hover:bg-orange-50"
      }`}
    >
      {rate}+
    </button>
  );
};

const CheckboxOption = ({ id, label, checked, onChange, value }) => {
  return (
    <div className="w-full flex items-center gap-4 py-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => onChange(value)}
        className="w-5 h-5 accent-orange-500  rounded border-gray-300 focus:ring-orange-500"
      />
      <label htmlFor={id} className="text-lg font-medium cursor-pointer">
        {label}
      </label>
    </div>
  );
};

export default function FiltersBar() {
  const { filters, setFilters } = useSearch();

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRatingChange = (rating) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }));
  };

  const handleTypeChange = (filter, value) => {
    setFilters((prev) => {
      const currentValues = prev[filter] || [];
      return {
        ...prev,
        [filter]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      };
    });
  };

  const formatMinutesToTime = (minutes) => {
    const safeMinutes = Number.isFinite(minutes)
      ? Math.max(0, Math.min(minutes, 1439))
      : 720;
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`;
  };

  const filterOptions = {
    tripTypes: ["Standard", "All inclusive", "Group", "Solo", "Road Trip"],
    experienceTypes: [
      "Adventure",
      "Cultural",
      "Eco     ",
      "Wellness",
      "Romantic",
      "Festival",
    ],
    destinationTypes: ["City", "Beach", "Mountain", "Island", "Cruise"],
    transportType: ["Car", "Bus", "Air plane", "Cruise"],
  };

  return (
    <div className="w-full md:w-1/4 px-4 py-6 border-r flex flex-col bg-gray-100 rounded-lg h-fit sticky top-4">
      <h2 className="text-2xl font-semibold mb-6">Filters</h2>
      {[
        {
          filterTitle: "Price",
          content: (
            <div className="w-full py-4 flex flex-col gap-4">
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={filters.priceRange?.[1] || 500}
                onChange={(e) =>
                  handleFilterChange("priceRange", [
                    0,
                    parseInt(e.target.value),
                  ])
                }
                className="w-full range-input"
              />
              <div className="flex justify-between items-center">
                 <span className="text-lg font-medium">
                  ${filters.priceRange?.[1] || 500}
                </span>
               </div>
            </div>
          ),
        },
        {
          filterTitle: "Departure Time",
          content: (
            <div className="w-full py-4 flex flex-col gap-4">
              <input
                type="range"
                min="0"
                max="1439"
                step="30"
                value={filters.departureTimeRange?.[1] || 720}
                onChange={(e) =>
                  handleFilterChange("departureTimeRange", [
                    0,
                    parseInt(e.target.value),
                  ])
                }
                className="w-full range-input"
              />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  {formatMinutesToTime(filters.departureTimeRange?.[1])}
                </span>
              </div>
            </div>
          ),
        },
        {
          filterTitle: "Rating",
          content: (
            <div className="w-full py-4 flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <RatingButton
                  key={rating}
                  rate={rating}
                  active={filters.rating === rating}
                  onClick={handleRatingChange}
                />
              ))}
            </div>
          ),
        },
        {
          filterTitle: "Trip Type",
          content: (
            <div className="w-full py-2 flex flex-col gap-2">
              {filterOptions.tripTypes.map((type, index) => (
                <CheckboxOption
                  key={type}
                  id={`trip-type-${index}`}
                  label={type}
                  value={type}
                  checked={filters.tripType?.includes(type)}
                  onChange={(value) => handleTypeChange("tripType", value)}
                />
              ))}
            </div>
          ),
        },
        {
            filterTitle: "Experience Type",
            content: (
              <div className="w-full py-2 flex flex-col gap-2">
                {filterOptions.experienceTypes.map((type, index) => (
                  <CheckboxOption
                    key={type}
                    id={`experience-type-${index}`}
                    label={type}
                    value={type}
                    checked={filters.experienceType?.includes(type)}
                    onChange={(value) =>
                      handleTypeChange("experienceType", value)
                    }
                  />
                ))}
              </div>
            ),
          },{
            filterTitle: "Destination Type",
            content: (
              <div className="w-full py-2 flex flex-col gap-2">
                {filterOptions.destinationTypes.map((type, index) => (
                  <CheckboxOption
                    key={type}
                    id={`destination-type-${index}`}
                    label={type}
                    value={type}
                    checked={filters.destinationType?.includes(type)}
                    onChange={(value) =>
                      handleTypeChange("destinationType", value)
                    }
                  />
                ))}
              </div>
            ),
          },,{
            filterTitle: "Transport Type",
            content: (
              <div className="w-full py-2 flex flex-col gap-2">
                {filterOptions.transportType.map((type, index) => (
                  <CheckboxOption
                    key={type}
                    id={`transport-type-${index}`}
                    label={type}
                    value={type}
                    checked={filters.transportType?.includes(type)}
                    onChange={(value) =>
                      handleTypeChange("transportType", value)
                    }
                  />
                ))}
              </div>
            ),
          },
      ].map((el, index) => (
        <FilterEl key={`filter-${index}`} {...el} />
      ))}
    </div>
  );
}
