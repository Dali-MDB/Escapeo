"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_URL } from "@/app/utils/constants";
import InputLogin from "@/app/components/inputLogin";
import CustomDropdown from "../../Components/DropDown";
import { useTrip } from "../../context/tripContext";



const DeparturesSection = ({departures , handleDepartureChange ,  isSubmitting , removeDeparturePlace , addDeparturePlace}) => (
  <div className="w-full flex flex-col justify-center items-center gap-2">
    <h4 className="text-xl w-full font-semibold mb-4">Departures</h4>

    {departures.map((place, index) => (
      <div key={index} className="flex  grid grid-cols-4 gap-4 mb-4 w-full items-center justify-center">
        <InputLogin
          type="text"
          name="location"
          value={place.location || ""}
          onChange={(e) => handleDepartureChange(index, e)}
          placeholder="Location"
          required
          className="flex-1"
        />
        <InputLogin
          type="number"
          name="capacity"
          value={place.capacity || ""}
          onChange={(e) => handleDepartureChange(index, e)}
          placeholder="Capacity"
          min={1}
          className="w-24"
        />
        <InputLogin
          type="number"
          name="price"
          value={place.price || ""}
          onChange={(e) => handleDepartureChange(index, e)}
          placeholder="Price"
          className="w-24"
        />

        <button
          type="button"
          onClick={() => removeDeparturePlace(index)}
          className="bg-[var(--secondary)]  text-white px-4 py-2 rounded-xl"
          disabled={isSubmitting}
        >
          Remove
        </button>
      </div>
    ))}
    
    <div className="w-full flex justify-center items-center">
      <button
        type="button"
        onClick={addDeparturePlace}
        className="px-4 py-2 rounded-xl bg-[var(--secondary)] text-white"
        disabled={isSubmitting}
      >
        Add Departure Place
      </button>
    </div>
  </div>
);

import Image from "next/image";
export default function TripForm() {
  const {INITIAM_FORM_STATE} = useTrip()

  const router = useRouter();
  let id = null;
  const isEditing = !!id;

  // State management
  const [formData, setFormData] = useState(INITIAM_FORM_STATE);
  const [departures, setDepartures] = useState([]);
  const [tripImages, setTripImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Main form, 2: Images & Departures
  const [initialDepartures, setInitialDepartures] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } 

  useEffect(() => {
    const fetchTripData = async () => {
      id = localStorage.getItem("tripSelected")
      try {
        const response = await fetch(`${API_URL}/trip_details/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch trip data");
        
        const data = await response.json();
        console.log(data)
        
        setFormData({
          title: data.title,
          capacity: data.capacity,
          description: data.description,
          airlineCompany: data.airline_company,
          stars_rating: data.stars_rating,
          is_one_way: data.is_one_way,
          departure_date: formatDate(data.departure_date),
          return_date: data.is_one_way ? null : formatDate(data.return_date),
          destination: data.destination,
          trip_type: data.trip_type,
          price_category: data.price_category,
          experience: data.experience,
          transport: data.transport,
          destination_type: data.destination_type,
          guide: data.guide?.id || ""
        });

        setDepartures(data.departure_places || []);
        setInitialDepartures(data.departure_places || []);
        setExistingImages(data.images || []);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTripData();
  }, [id, isEditing]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {

    let totalCapacity = 0
    for (const departure of departures) {
      totalCapacity += departure.capacity;
    }

    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const nid = localStorage.getItem("tripSelected")
    setFormData(prev => ({
      ...prev,
      capacity: totalCapacity
    }))
    console.log(formData)
    try {
      const token = localStorage.getItem("accessToken");
      const url =  `${API_URL}/trip_details/${nid}`
      console.log(url)
      console.log(JSON.stringify(formData))
      console.log(token)
      const method = "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      
      
      
      if (isEditing) {
        router.push(`/Dashboard/MyTrips`);
      } else {
        setStep(2); // Move to next step for new trips
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Departure handlers
  const addDeparturePlace = () => {
    setDepartures(prev => [...prev, { 
      location: "", 
      capacity: 0, 
      price: 0, 
      sold_tickets: 0 
    }]);
  };

  const handleDeleteExistingDeparture = async (departureId) => {
    try {
      const nid = localStorage.getItem("tripSelected")
      const response = await fetch(`${API_URL}/departure_details/${nid}/${departureId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete departure');
      }
      
      // Remove from local state
      setDepartures(prev => prev.filter(dep => dep.id !== departureId));
      setInitialDepartures(prev => prev.filter(dep => dep.id !== departureId));
    } catch (error) {
      setError("Failed to delete departure");
    }
  };

  const removeDeparturePlace = (index) => {
    const departureToRemove = departures[index];
    
    // If the departure has an ID, it's an existing one that needs to be deleted from the backend
    if (departureToRemove.id) {
      handleDeleteExistingDeparture(departureToRemove.id);
    } else {
      // If no ID, it's a new departure that only needs to be removed from local state
      setDepartures(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDepartureChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDepartures = [...departures];
    updatedDepartures[index][name] = name === "capacity" || name === "price" || name === "sold_tickets"
      ? Number(value)
      : value;
    setDepartures(updatedDepartures);
  };

  // Image handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log(files)
    setTripImages(prev => [...prev, ...files]);
  };

  const handleImageDelete = (index) => {
    setTripImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId) => {

    const nid = localStorage.getItem("tripSelected")
    console.log(nid)
    console.log(imageId)
    console.log(localStorage.getItem("accessToken"))
    console.log(JSON.stringify({deleted_images: [imageId]}))
    try {
      const response = await fetch(`${API_URL}/delete_trip_images/${nid}`, {
        method: 'POST', 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({deleted_images: [imageId]})
      });
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }   
      const result = await response.json();
      console.log(result)
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      setError("Failed to delete image");
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Only add new departures that weren't in the initial fetch
      const newDepartures = departures.filter((departure, index) => {
        // If the departure is not in initialDepartures, it's new
        return !initialDepartures.some(initial => 
          initial.location === departure.location &&
          initial.capacity === departure.capacity &&
          initial.price === departure.price
        );
      });
      

      if (newDepartures.length > 0) {
        await Promise.all(
          newDepartures.map(async departure => {
            const nid = localStorage.getItem("tripSelected")
            const response = await fetch(
              `${API_URL}/add_trip_departure/${nid}`, 
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                },
                body: JSON.stringify(departure)
              }
            );
            if (!response.ok) throw new Error('Failed to add departure');
          })
        );
      }

      // Submit images if there are new ones
      if (tripImages.length > 0) {
        const formData = new FormData();
        tripImages.forEach(file => formData.append("uploaded_images", file));
        const nid = localStorage.getItem("tripSelected")
        await fetch(
          `${API_URL}/add_trip_images/${nid}`, 
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: formData
          }
        );
      }

      //need to update the capacity of the trip
      const totalCapacity = departures.reduce((acc, dep) => acc + dep.capacity, 0);
      const nid = localStorage.getItem("tripSelected")
      const response = await fetch(`${API_URL}/trip_details/${nid}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ capacity: totalCapacity })
      
      });

      alert("Trip updated successfully");
      router.push(`/Dashboard/MyTrips`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form sections
  const FlightOptionsSection = () => {
    const toggleOneWay = () => {
      setFormData(prev => ({
        ...prev,
        is_one_way: !prev.is_one_way
      }));
    };

    return (
      <div className="mb-0">
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={toggleOneWay}
            className={`px-4 py-2 rounded-lg transition-colors ${
              formData.is_one_way
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
              type="datetime-local"
              name="return_date"
              value={formData.return_date || ""}
              onChange={handleChange}
              placeholder="Return Date"
              required={!formData.is_one_way}
            />
            
          </div>
        )}
      </div>
    );
  };

  const ImageUploadSection = () => (
    <div className="my-6 flex flex-col w-full">
      <h2 className="text-xl font-semibold mb-6">Trip Images</h2>
      
      {/* Existing images */}
      <div className="flex flex-wrap gap-4 mb-6">
        {existingImages.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={`${API_URL}${image.image}`}
              alt="Trip preview"
              className="h-32 w-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleDeleteExistingImage(image.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* New image upload */}
      <input
        type="file"
        multiple
        onChange={handleImageUpload}
        accept="image/*"
        className="mb-4"
        disabled={isSubmitting}
      />
      
      {/* New image previews */}
      <div className="flex flex-wrap gap-4 mb-6">
        {tripImages.map((image, index) => (
          <div key={`new-${index}`} className="relative">
            <img
              src={URL.createObjectURL(image)}
              alt={`Preview ${index}`}
              className="h-32 w-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleImageDelete(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );


  // Main render
  return (
    <div className="w-full flex justify-center gap-6 mx-auto">
      <div className="bg-[var(--bg-color)] rounded-xl shadow-md p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">
          {"Edit Trip"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Flight Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Flight Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputLogin
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="Trip Title"
                  required
                />
                <InputLogin
                  type="text"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Trip Description"
                  required
                />
                
                <InputLogin
                  type="number"
                  name="stars_rating"
                  value={formData.stars_rating || ""}
                  onChange={handleChange}
                  placeholder="Star Rating (1-5)"
                  min={1}
                  max={5}
                  required
                />
              </div>
            </div>

            {/* Departure Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Departure Information</h2>
              <div className="grid grid-cols-1  gap-4">
                <InputLogin
                  type="date"
                  name="departure_date"
                  value={formData.departure_date || ""}
                  onChange={handleChange}
                  placeholder="Departure Date"
                  required

                />
                
              </div>
            </div>

            {/* Destination Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Destination Information</h2>
              <div className="flex flex-col gap-4">
                <InputLogin
                  type="text"
                  name="destination"
                  value={formData.destination || ""   }
                  onChange={handleChange}
                  placeholder="Destination"
                  required
                />
                <FlightOptionsSection />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => router.push("/Dashboard/Trips")}
                className="px-4 py-2 rounded-lg border border-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-[#035280] text-white disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Continue"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
              <DeparturesSection 
              departures={departures} 
              handleDepartureChange={handleDepartureChange} 
              isSubmitting={isSubmitting} 
              removeDeparturePlace={removeDeparturePlace} 
              addDeparturePlace={addDeparturePlace}
            />
            <ImageUploadSection />
            
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg border border-gray-300"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-[#035280] text-white disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Complete Trip"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}