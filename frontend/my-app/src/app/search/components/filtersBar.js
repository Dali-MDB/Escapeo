"use client";

import { useSearch } from "@/app/context/SearchContext";
import { useState } from "react";
import { arrowIconDown, arrowIconUp } from "@/app/data/data";
import { useRouter } from "next/navigation";

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



// Updated CheckboxOption component to handle checked state properly
const CheckboxOption = ({ id, label, checked, onChange, value }) => {
  return (
    <div className="w-full flex items-center gap-4 py-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(value, e.target.checked)}
        className="w-5 h-5 accent-orange-500 rounded border-gray-300 focus:ring-orange-500"
      />
      <label htmlFor={id} className="text-lg font-medium cursor-pointer">
        {label}
      </label>
    </div>
  );
};

export default function FiltersBar() {
  const router = useRouter();
  const { 
    filters, 
    setFilters ,
    executeSearch, 
    searchData,
    updateArrayFilter,
    updatePriceRange,
    PRICE_CATEGORIES,
    DESTINATION_TYPES,
    TRANSPORT_TYPES,
    EXPERIENCE_LEVELS,
    TRIP_TYPES
  } = useSearch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await executeSearch({
      // Only pass basic search parameters
      departure_city: searchData.departure_city,
      destination: searchData.destination,
      departure_date: searchData.departure_date,
      return_date: searchData.return_date,
      is_one_way: searchData.is_one_way
    });
    if (success) {
      router.push('/search/flight');
    }
  };

  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      min_stars: prev.min_stars === rating ? 0 : rating,
      max_stars: 5
    }));
  };

  

  // Get filter options from context constants
  const filterOptions = {
    tripTypes: TRIP_TYPES || [],
    experienceTypes: EXPERIENCE_LEVELS || [],
    destinationTypes: DESTINATION_TYPES || [],
    transportTypes: TRANSPORT_TYPES || []
  };

  // Handler for checkbox changes
  const handleCheckboxChange = (filterKey, value, isChecked) => {
    updateArrayFilter(filterKey, value, isChecked);
  };

  return (
    <div className="w-full md:w-1/4 px-4 py-6 border-r flex flex-col bg-gray-100 rounded-lg h-fit sticky top-4">
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Filters</h2>
        <button 
          className="rounded-xl p-2 bg-[var(--primary)] text-[var(--bg-color)]" 
          onClick={handleSubmit}
        >
          Apply filters
        </button>
      </div>

      {[
        {
          filterTitle: "Price",
          content: (
            <div className="w-full py-4 flex flex-col gap-4">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.priceRange?.[1] || 5000}
                onChange={(e) =>
                  updatePriceRange([
                    filters.priceRange?.[0] || 0,
                    parseInt(e.target.value)
                  ])
                }
                className="w-full range-input"
              />
              <div className="flex justify-between items-center">
                <span>${filters.priceRange?.[0] || 0}</span>
                <span className="text-lg font-medium">
                  ${filters.priceRange?.[1] || 5000}
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
                  active={filters.min_stars === rating}
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
                  key={type.value}
                  id={`trip-type-${index}`}
                  label={type.label}
                  value={type.value}
                  checked={filters.trip_types?.includes(type.value)}
                  onChange={(value, checked) => 
                    handleCheckboxChange("trip_types", value, checked)
                  }
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
                  key={type.value}
                  id={`experience-type-${index}`}
                  label={type.label}
                  value={type.value}
                  checked={filters.experiences?.includes(type.value)}
                  onChange={(value, checked) => 
                    handleCheckboxChange("experiences", value, checked)
                  }
                />
              ))}
            </div>
          ),
        },
        {
          filterTitle: "Destination Type",
          content: (
            <div className="w-full py-2 flex flex-col gap-2">
              {filterOptions.destinationTypes.map((type, index) => (
                <CheckboxOption
                  key={type.value}
                  id={`destination-type-${index}`}
                  label={type.label}
                  value={type.value}
                  checked={filters.destination_types?.includes(type.value)}
                  onChange={(value, checked) => 
                    handleCheckboxChange("destination_types", value, checked)
                  }
                />
              ))}
            </div>
          ),
        },
        {
          filterTitle: "Transport Type",
          content: (
            <div className="w-full py-2 flex flex-col gap-2">
              {filterOptions.transportTypes.map((type, index) => (
                <CheckboxOption
                  key={type.value}
                  id={`transport-type-${index}`}
                  label={type.label}
                  value={type.value}
                  checked={filters.transports?.includes(type.value)}
                  onChange={(value, checked) => 
                    handleCheckboxChange("transports", value, checked)
                  }
                />
              ))}
            </div>
          ),
        }
      ].map((el, index) => (
        <FilterEl key={`filter-${index}`} {...el} />
      ))}
    </div>
  );
}