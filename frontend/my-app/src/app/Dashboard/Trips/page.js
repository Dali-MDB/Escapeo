"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/utils/constants";
import { getMyProfile } from "@/app/utils/auth";
import InputLogin from "@/app/components/inputLogin";
import CustomDropdown from "../Components/DropDown";
import { useTrip } from "../context/tripContext";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "@/app/context/FormContext";
import { data } from "../data";




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




const TripDetailsSection = ({ formData, handleChange, TRIP_TYPES, PRICE_CATEGORIES, EXPERIENCE_LEVELS, TRANSPORT_TYPES , setFormData }) => {
  const dropdowns = [
    { val: TRIP_TYPES, name: 'trip_type', label: 'Trip Type' },
    { val: PRICE_CATEGORIES, name: 'price_category', label: 'Price Category' },
    { val: EXPERIENCE_LEVELS, name: 'experience', label: 'Experience Type' },
    { val: TRANSPORT_TYPES, name: 'transport', label: 'Transport' }
  ];
  const handleDChange  = (val) => {
    setFormData(prev => ({
      ...prev,
      [val.name]: val.value
    }))
  }
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
            onChange={(value) => handleChange({
              target: {
                name: dropdown.name,
                value: value
              }
            })}
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
}) => {
  const departureFields = [
    { type: "date", name: "departure_date", placeholder: "Departure Date" },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Departure Information</h2>
      <div className="grid grid-cols-2 gap-4">

        <InputLogin
          type={"datetime-local"}
          name={"departure_date"}
          value={formData?.departure_date}
          onChange={handleChange}
          placeholder={"Departure Date"}
          required
        />
        <InputLogin
          type="time"
          name="departureTime"
          placeholder="Departure Time"
          value={formData.departureTime}
          onChange={handleChange}
          required
        />

      </div>
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
        {
          [
            { val: DESTINATION_TYPES, name: 'destination_type', label: 'Destination Type' },
                     ].map(dropdown => (
                      <CustomDropdown
                        key={dropdown.name}
                        name={dropdown.name}
                        options={dropdown.val}
                        selectedValue={formData[dropdown.name]}
                        onChange={(value) => handleChange({
                          target: {
                            name: dropdown.name,
                            value: value
                          }
                        })}
                        placeholder={dropdown.label}
                      />
                    ))}
      </div>
    </div>
  )

}


const DeparturesSection = ({ departures, handleDepartureChange, removeDeparturePlace, addDeparturePlace }) => {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">

      <h4 className="text-xl w-full font-semibold mb-4">Departures</h4>

      {departures.map((place, index) => (
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
      <div className="w-full flex justify-center items-center ">
        <button
          onClick={addDeparturePlace}
          className="px-4 py-2 rounded-xl bg-[var(--secondary)]  text-white "
        >
          Add Departure Place
        </button>
      </div>
    </div>)
}

const ImageUploadSection = ({ tripImages, handleImageUpload, handleImageDelete, handleImagesDeparturesSubmit }) => (
  <div className="my-6 flex flex-col w-full">
    <h2 className="text-xl font-semibold mb-6">Trip Images</h2>
    <input
      type="file"
      multiple
      onChange={handleImageUpload}
      accept="image/*"
      className="mb-4"
    />
    {/* Preview images */}
    <div className="flex my-2 gap-2">
      {tripImages.length > 0 && tripImages.map((image, index) => (
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
            x
          </button>
        </div>
      ))}
    </div>

    <button onClick={handleImagesDeparturesSubmit} className="px-6 py-2 rounded-xl bg-[var(--primary)] text-white disabled:bg-blue-300"
    >Submit</button>
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

    <div className="w-full  flex justify-center gap-6 mx-auto">
      {flights ? (
        <div className="grid grid-cols-3 gap-x-4 gap-y-8 w-full justify-items-center">
          {flights.map((flight, index) => (
            <FlightBox key={index} link={"#"} id={flight.id} backgroundImage={flight?.images[0]?.image} title={flight.title} description={flight.description} price={flight.departure_places[0]?.price} />
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


  const { tripImages, setTripImages,
    departures, setDepartures, formData, setFormData, INITIAM_FORM_STATE, PRICE_CATEGORIES, DESTINATION_TYPES, TRANSPORT_TYPES, EXPERIENCE_LEVELS, TRIP_TYPES, guides } = useTrip();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [readyToAddImages, setReadyToAddImages] = useState(false)
  const [tripId, setTripId] = useState(null)
  // Update your handleSubmit to include images

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

    const fligh = await response.json();


    setFlights(fligh);



  }
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");

      // Calculate total capacity from departure places
      
      // Create a copy of formData with the total capacity
      const formDataWithCapacity = {
        ...formData,
        capacity: 1
      };

      const res = await fetch(`http://127.0.0.1:8000/add_trip/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formDataWithCapacity)
      })
      if (res.ok) {
        const data = await res.json();
        console.log(data)
        setFormData(INITIAM_FORM_STATE); // reset form

        setTripId(data.trip_id)

        setReadyToAddImages(true)

      }
      else {
        throw new Error('failed')
      }


    } catch (err) {
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

    setDepartures(prev => [...prev, { location: "", capacity: 0, price: 0, sold_tickets: 0 }])
  };

  const removeDeparturePlace = (index) => {

    setDepartures(prev => prev.filter((_, i) => i !== index));


  };

  const handleDepartureChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDepartures = [...departures];
    updatedDepartures[index][name] = name === "capacity" || name === "price" || name === "sold_tickets"
      ? Number(value)
      : value;
    setDepartures(updatedDepartures);
  };

  const handleImageDelete = (index) => {
    setTripImages(prev => prev.filter((_, i) => i !== index));
  };


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setTripImages(prev => [...prev, ...files]);
    console.log(tripImages)
  };
  const [flights, setFlights] = useState([]);

  


  const handleImagesSubmit = async () => {
    const formData = new FormData();

    // Append each file to FormData (key can be "images" or any name your backend expects)
    tripImages.forEach((file, index) => {
      formData.append("uploaded_images", file);
    });

    const repsonse = fetch(`${API_URL}/add_trip_images/${tripId}`, {
      method: 'POST',
      headers: {

        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,

      }, body: formData

    })




  }
  const submitDepartures = async () => {
    try {
      // Calculate total capacity first
      const totalCapacity = departures.reduce((acc, curr) => acc + curr.capacity, 1);
      console.log(localStorage.getItem("accessToken"))
      console.log(totalCapacity)
      // Update trip capacity
      const updateResponse = await fetch(`${API_URL}/trip_details/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ capacity: totalCapacity })
      });

      
      // Then add all departures
      const results = await Promise.all(
        departures.map(async departure => {
          const response = await fetch(`${API_URL}/add_trip_departure/${tripId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(departure)
          });
          if (!response.ok) throw new Error('Failed on one departure');
          return response.json();
        })
      );

      alert(`${results.length} departures added successfully!`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleImagesDeparturesSubmit = async (e) => {
    e.preventDefault()
    submitDepartures();
    handleImagesSubmit();
    setFormData(INITIAM_FORM_STATE)
    setReadyToAddImages(false)
  }
  return !readyToAddImages ? (
    <div className="w-full flex justify-center gap-6 mx-auto">


      <div className="bg-[var(--bg-color)] rounded-xl shadow-md p-6 w-2/3">

        <h1 className="text-2xl font-bold mb-6">Add a New Flight</h1>

        <div onSubmit={handleSubmit} className="space-y-6">
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
            formData={formData} handleChange={handleChange} />

          <GuideSelectionSection guides={guides} formData={formData} handleChange={handleChange} />


          <DestinationInformationSection
            formData={formData}
            handleChange={handleChange}
            DESTINATION_TYPES={DESTINATION_TYPES}
          />

          <FormActions handleSubmit={handleSubmit} setFormData={setFormData} />
        </div>


      </div>
    </div>
  )
    :
    (
      <div className="w-full flex justify-center gap-6 mx-auto ">
        <div className="bg-[var(--bg-color)] rounded-xl shadow-md p-6 w-[45%]">
          <DeparturesSection departures={departures} addDeparturePlace={addDeparturePlace} handleDepartureChange={handleDepartureChange} removeDeparturePlace={removeDeparturePlace} />
          <ImageUploadSection tripImages={tripImages} handleImageUpload={handleImageUpload} handleImageDelete={handleImageDelete} handleImagesSubmit={handleImagesSubmit} handleImagesDeparturesSubmit={handleImagesDeparturesSubmit} />
        </div>
      </div>
    );


}