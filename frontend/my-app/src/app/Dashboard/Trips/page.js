"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/utils/constants";
import { getMyProfile } from "@/app/utils/auth";
import InputLogin from "../Components/InputLogin";
import CustomDropdown from "../Components/DropDown";
import { useTrip } from "../context/tripContext";

// Move all components outside the main function

const FlightOptionsSection = ({ formData, handleChange }) => (
  <div className="mb-6">
    <div className="flex items-center mb-4">
      <input
        type="checkbox"
        id="is_one_way"
        name="is_one_way"
        checked={formData.is_one_way}
        onChange={handleChange}
        className="mr-2"
      />
      <label htmlFor="is_one_way">One-way flight</label>
    </div>
    {!formData.is_one_way && (
      <InputLogin
        type="datetime-local"
        name="return_date"
        value={formData.return_date}
        onChange={handleChange}
        placeholder="Return Date"
        required={!formData.is_one_way}
      />
    )}
  </div>
);

const FlightInformationSection = ({ formData, handleChange }) => {
  const flightFields = [
    { type: "text", name: "title", placeholder: "Trip Title" },
    { type: 'text', name: "description", placeholder: "Trip Description" },
    { type: "text", name: "airlineCompany", placeholder: "Airline Company" },
    { type: "number", name: "stars_rating", placeholder: "Star Rating (1-5)", min: 1, max: 5 },
  ];
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Flight Information</h2>
      <div className="grid grid-cols-2 gap-4">
        {flightFields.map(field => (
          <InputLogin
            key={field.name}
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            required
          />
        ))}
      </div>
    </div>
  );
};

const TripDetailsSection = ({ formData, handleChange, TRIP_TYPES, PRICE_CATEGORIES, EXPERIENCE_LEVELS, TRANSPORT_TYPES }) => {
  const dropdowns = [
    { val: TRIP_TYPES, name: 'trip_type', label: 'Trip Type' },
    { val: PRICE_CATEGORIES, name: 'price_category', label: 'Price Category' },
    { val: EXPERIENCE_LEVELS, name: 'experience', label: 'Experience Type' },
    { val: TRANSPORT_TYPES, name: 'transport', label: 'Transport' }
  ];
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
      <div className="grid grid-cols-2 gap-4">
        {dropdowns.map(dropdown => (
          <CustomDropdown
            key={dropdown.name}
            name={dropdown.name}
            options={dropdown.val}
            selectedValue={formData[dropdown.name]}
            onChange={handleChange}
            placeholder={dropdown.label}
          />
        ))}
      </div>
    </div>
  );
};

const DepartureInformationSection = ({ 
  formData, 
  handleChange, 
  handleDepartureChange, 
  addDeparturePlace, 
  removeDeparturePlace 
}) => {
  const departureFields = [
    { type: "date", name: "departure_date", placeholder: "Departure Date" },
    { type: "time", name: "departureTime", placeholder: "Departure Time" },
  ];  

  return (  
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Departure Information</h2>
      <div className="grid grid-cols-2 gap-4">
        {departureFields.map(field => (
          <InputLogin
            key={field.name}
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            required
          />
        ))}
      </div>
      <h4 className="text-lg my-4">Places</h4>
      {formData.departure_places.map((place, index) => (
        <div key={index} className="flex items-center gap-4 mb-4">
          <InputLogin
            type="text"
            name="location"
            value={place.location || ""}
            onChange={(e) => handleDepartureChange(index, e)}
            placeholder="Location"
            required
          />
          <InputLogin
            type="number"
            name="capacity"
            value={place.capacity}
            onChange={(e) => handleDepartureChange(index, e)}
            placeholder="Capacity"
            min={1}
          />
          <InputLogin
            type="number"
            name="price"
            value={place.price}
            onChange={(e) => handleDepartureChange(index, e)}
            placeholder="Price"
          />
          <button
            type="button"
            onClick={() => removeDeparturePlace(index)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addDeparturePlace}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white mt-2"
      >
        Add Departure Place
      </button>
    </div>
  );
};

const FormActions = ({ router }) => (
  <div className="flex justify-end gap-4 mt-6">
    <button
      type="button"
      onClick={() => router.back()}
      className="px-4 py-2 rounded-lg border border-gray-300"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-6 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-300"
    >
      Save
    </button>
  </div>
);



async function handleSubmit(e) {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);
  try {
    const token = localStorage.getItem("accessToken");
    const response = await getMyProfile();
    const user = response.profile;

    const payload = {
      title: `${formData.title} `,
      description: `${formData.description} `,
      capacity: formData.capacity,
      sold_tickets: 0,
      trip_type: formData.trip_type,
      experience: formData.experience,
      price_category: formData.price_category,
      destination: formData.destination,
      destination_type: formData.destination_type,
      transport: formData.transport,
      stars_rating: formData.stars_rating,
      departure_date: formData.departure_date,
      return_date: formData.is_one_way ? null : formData.return_date,
      is_one_way: formData.is_one_way,
      airlineCompany: formData.airlineCompany,
      departureTime: formData.departureTime,
      arrivalTime: formData.arrivalTime,
      from: formData.from,
      departure_places: formData.departure_places.map(place => ({
        location: place.location,
        capacity: Number(place.capacity),
        price: Number(place.price)
      }))
    };
    console.log("token:", token);
    console.log("Payload:", JSON.stringify(payload));
    const apiResponse = await fetch(`${API_URL}/add_trip/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await apiResponse.json();
    setFormData(INITIAM_FORM_STATE);
    alert("Trip added successfully!");

  } catch (err) {
    alert("Error adding trip: " + err.message);
  }
}
// Main component
export default function Trips() {
  const { formData, setFormData, PRICE_CATEGORIES, DESTINATION_TYPES, TRANSPORT_TYPES, EXPERIENCE_LEVELS, TRIP_TYPES } = useTrip();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const addDeparturePlace = () => {
    setFormData(prev => ({
      ...prev,
      departure_places: [...prev.departure_places, { location: "", capacity: 1, price: 0 }]
    }));
  };

  const removeDeparturePlace = (index) => {
    setFormData(prev => ({
      ...prev,
      departure_places: prev.departure_places.filter((_, i) => i !== index)
    }));
  };
  const handleDepartureChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDepartures = [...formData.departure_places];
    updatedDepartures[index][name] = name === "capacity" || name === "price"
      ? Number(value)
      : value;
    setFormData(prev => ({
      ...prev,
      departure_places: updatedDepartures
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Add a New Flight</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FlightInformationSection 
            formData={formData} 
            handleChange={handleChange} 
          />
          
          <TripDetailsSection 
            formData={formData}
            handleChange={handleChange}
            TRIP_TYPES={TRIP_TYPES}
            PRICE_CATEGORIES={PRICE_CATEGORIES}
            EXPERIENCE_LEVELS={EXPERIENCE_LEVELS}
            TRANSPORT_TYPES={TRANSPORT_TYPES}
          />
          
          <DepartureInformationSection 
            formData={formData}
            handleChange={handleChange}
            handleDepartureChange={handleDepartureChange}
            addDeparturePlace={addDeparturePlace}
            removeDeparturePlace={removeDeparturePlace}
          />
          
          <FlightOptionsSection 
            formData={formData} 
            handleChange={handleChange} 
          />
          
          <FormActions router={router} />
        </form>
      </div>
    </div>
  );
}