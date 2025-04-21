"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/utils/constants";
import { getMyProfile } from "@/app/utils/auth";
import InputLogin from "../Components/InputLogin";
import CustomDropdown from "../Components/DropDown";
import { useTrip } from "../context/tripContext";
import { set } from "date-fns";
import FlightBox from "../Components/FlightBox";


// Move all components outside the main function

const FlightOptionsSection = ({ formData, handleChange }) => {




  const toggleOneWay = () => {
    handleChange({
      target: {
        name: "is_one_way",
        type: "checkbox",
        checked: !formData.is_one_way
      }
    });
  };

  return (
    <div className="mb-0">
      <div className="flex items-center mb-4">
        <button
          type="button"
          onClick={toggleOneWay}
          className={`px-4 py-2 rounded-lg transition-colors ${formData.is_one_way
            ? "bg-[#035280] text-white"
            : "bg-transparent text-gray-800"
            }`}
        >
          One-way flight
        </button>
      </div>
      {!formData.is_one_way && (
        <div className="flex flex-col gap-4">
          <InputLogin
            type="date"
            name="return_date"
            value={formData.return_date || new Date()}
            onChange={handleChange}
            placeholder="Return Date"
            required={!formData.is_one_way}
          />
          <InputLogin
            type="time"
            name="return_time"
            value={formData.return_time || new Date()}
            onChange={handleChange}
            placeholder="Return Date"
            required={!formData.is_one_way}
          />


        </div>
      )}
    </div>
  );
};

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
        className="px-4 py-2 rounded-lg bg-[#035280] text-white mt-2"
      >
        Add Departure Place
      </button>
    </div>
  );
};

const DestinationInformationSection = ({ formData, handleChange, DESTINATION_TYPES }) => {
  return (

    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Destination Information</h2>
      <div className="flex flex-col gap-4 align-items-center">
        <InputLogin
          type="text"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          placeholder="Destination"
          required
        />



        <FlightOptionsSection
          formData={formData}
          handleChange={handleChange}
        />
        <CustomDropdown
          name="destination_type"
          options={DESTINATION_TYPES}
          selectedValue={formData.destination_type}
          onChange={handleChange}
          placeholder="Destination Type"
        />
      </div>
    </div>
  )

}


const ImageUploadSection = ({ formData, handleImageUpload, handleImageDelete }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-4">Trip Images</h2>
    <input
      type="file"
      multiple
      onChange={handleImageUpload}
      accept="image/*"
      className="mb-4"
    />
    <div className="flex flex-wrap gap-2">
      {formData.uploaded_images.map((image, index) => (
        <div key={index} className="relative">
          <img
            src={URL.createObjectURL(image)}
            alt={`Preview ${index}`}
            className="h-24 w-24 object-cover rounded"
          />
          <button
            type="button"
            onClick={() => handleImageDelete(index)}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>
);



const GuideSelectionSection = ({ guides, formData, handleChange }) => {
  if (formData.trip_type !== 'group') return null;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Guide Information</h2>
      <select
        name="guide"
        value={formData.guide || ''}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required={formData.trip_type === 'group'}
      >
        <option value="">Select a guide</option>
        {guides.map(guide => (
          <option key={guide.id} value={guide.id}>
            {guide.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const FormActions = ({ handleSubmit, setFormData }) => {

  return (
    <div className="flex justify-end gap-4 mt-6">
      <button
        type="button"
        onClick={() => setFormData(INITIAM_FORM_STATE)}
        className="px-4 py-2 rounded-lg border border-gray-300"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        className="px-6 py-2 rounded-lg bg-[#035280] text-white disabled:bg-blue-300"
      >
        Save
      </button>
    </div>
  )
};



const FlightsAdded = ({ flights }) => {
  return (
  
  <div className=" text-white  rounded-xl w-full rounded-lg flex flex-col items-center justify-center">
    {flights.length > 0 ? (
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 w-full justify-items-center">
        {flights.filter(flight => flight.transport === "car").map((flight, index) => (
        <FlightBox key={index} link={"#"} backgroundImage={flight.images[0]} title={flight.title} description={flight.description} price={flight.departure_places[0]?.price} />
        ))}

      </div>
    ) : (
      <p>No related flights available.</p>
    )}

  </div>
  )
}



// Main component
export default function Trips() {
  const { formData, setFormData, INITIAM_FORM_STATE, PRICE_CATEGORIES, DESTINATION_TYPES, TRANSPORT_TYPES, EXPERIENCE_LEVELS, TRIP_TYPES, guides } = useTrip();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      uploaded_images: [...prev.uploaded_images, ...files]
    }));
  };

  // Handle image deletion
  const handleImageDelete = (index) => {
    setFormData(prev => {
      const newImages = [...prev.uploaded_images];
      newImages.splice(index, 1);
      return {
        ...prev,
        uploaded_images: newImages
      };
    });
  };






  // Update your handleSubmit to include images
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      const formDataToSend = new FormData();

      // Validate departure_places
      const hasInvalidDeparture = formData.departure_places.some(place =>
        !place.location || !place.capacity || !place.price
      );

      if (hasInvalidDeparture) {
        alert("Please fill all fields for departure places");
        setIsSubmitting(false);
        return;
      }

      // Append simple form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "uploaded_images" && key !== "departure_places") {
          formDataToSend.append(key, value);
        }
      });

      formData.uploaded_images.forEach((image, index) => {
        formDataToSend.append(`uploaded_images[${index}]`, image);
      });

      // Append departure places as JSON string
      formDataToSend.append("departure_places", JSON.stringify(formData.departure_places));



      console.log(token)

      const res = await fetch(`${API_URL}/add_trip/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create trip.");
      }

      alert("Trip created successfully!");
      setFormData(INITIAM_FORM_STATE); // reset form

    } catch (err) {
      console.error(err);
      setError(err.message);
      alert("Something went wrong: " + err.message);
    }
  }

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

  const [flights, setFlights] = useState([]);

  useEffect(() => {

    async function fetchRelatedFlights() {

      const response = await fetch(`${API_URL}/all_trips/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch related flights.");
      }

      return response.json();


    }
    fetchRelatedFlights()
      .then(data => {
        setFlights(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });



  }, []);

  return (
    <div className="w-full min-h-screen flex justify-center gap-6 mx-auto ">

      <div className="bg-[var(--bg-color)] w-full rounded-xl py-6 px-4 flex flex-col justify-center items-start">
        <h1 className="text-2xl font-bold mx-4 mb-8">Flights Added</h1>
        <FlightsAdded flights={flights} />
      </div>
      <div className="bg-[var(--bg-color)] rounded-xl shadow-md p-6 w-[45%]">
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
          <GuideSelectionSection guides={guides} formData={formData} handleChange={handleChange} />
          <DepartureInformationSection
            formData={formData}
            handleChange={handleChange}
            handleDepartureChange={handleDepartureChange}
            addDeparturePlace={addDeparturePlace}
            removeDeparturePlace={removeDeparturePlace}
          />

          <DestinationInformationSection
            formData={formData}
            handleChange={handleChange}
            DESTINATION_TYPES={DESTINATION_TYPES}
          />

          <ImageUploadSection formData={formData} handleImageUpload={handleImageUpload} handleImageDelete={handleImageDelete} />
          <FormActions handleSubmit={handleSubmit} setFormData={setFormData} />
        </form>
      </div>
    </div>
  );
}