"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/utils/constants";
import InputLogin from "../Components/InputLogin";
import Image from "next/image";

export default function AddHotel() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hotelImages, setHotelImages] = useState([]);
  const [readyToAddImages, setReadyToAddImages] = useState(false);
  const [hotelId, setHotelId] = useState(null);
  const initialFormData = {
    name: "",
    location: "",
    phone: "",
    email: "",
    address: "",
    stars_rating: 3,
    total_rooms: 0,
    total_occupied_rooms: 0,
    price_per_night: 0,
    amenities: "",
  }
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleImageDelete = (index) => {
    setHotelImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setHotelImages(prev => [...prev, ...files]);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    if (formData.total_occupied_rooms > formData.total_rooms) {
      setError("Occupied rooms cannot exceed total rooms");
      setIsSubmitting(false);
      return;
    }

    if (formData.stars_rating < 1 || formData.stars_rating > 5) {
      setError("Star rating must be between 1 and 5");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/add_hotel/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data)
        setHotelId(data.hotel.id);
        setReadyToAddImages(true);
      } else {
        const errorData = await res.json();
        console.log(errorData)
        throw new Error(errorData.Error || "Failed to add hotel");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImagesSubmit = async () => {
    if (!hotelId || hotelImages.length === 0) return;

    const formData = new FormData();
    hotelImages.forEach((file) => {
      formData.append("uploaded_images", file);
    });

    try {
      const response = await fetch(`${API_URL}/add_hotel_images/${hotelId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload images');
      
      alert("Hotel and images added successfully!");
      setReadyToAddImages(false)
      setFormData(initialFormData)
      router.push("/Dashboard/Stays");
    } catch (err) {
      setError(err.message);
    }
  };

  if (readyToAddImages) {
    return (
      <div className="w-full flex justify-center gap-6 mx-auto">
        <div className="bg-[var(--bg-color)] rounded-xl shadow-md p-6 w-[45%]">
          <h1 className="text-2xl font-bold mb-6">Add Hotel Images</h1>
          
          <div className="my-6 flex flex-col w-full">
            <h2 className="text-xl font-semibold mb-6">Hotel Images</h2>
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              accept="image/*"
              className="mb-4"
            />
            <div className="flex my-2 gap-2">
              {hotelImages.length > 0 && hotelImages.map((image, index) => (
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

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => router.push("/hotels")}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                Skip
              </button>
              <button
                onClick={handleImagesSubmit}
                className="px-6 py-2 rounded-lg bg-[#035280] text-white disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Upload Images"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  flex justify-center gap-6 mx-auto">
      <div className="bg-[var(--bg-color)] rounded-xl shadow-md p-6 w-2/3">
        <h1 className="text-2xl font-bold mb-6">Add a New Hotel</h1>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InputLogin
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Hotel Name"
              required
            />
            <InputLogin
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location (City, Country)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputLogin
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
            />
            <InputLogin
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>

          <InputLogin
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full Address"
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <InputLogin
              type="number"
              name="stars_rating"
              value={formData.stars_rating}
              onChange={handleChange}
              placeholder="Star Rating (1-5)"
              min={1}
              max={5}
              required
            />
            <InputLogin
              type="number"
              name="total_rooms"
              value={formData.total_rooms}
              onChange={handleChange}
              placeholder="Total Rooms"
              min={0}
              required
            />
            <InputLogin
              type="number"
              name="total_occupied_rooms"
              value={formData.total_occupied_rooms}
              onChange={handleChange}
              placeholder="Occupied Rooms"
              min={0}
              max={formData.total_rooms}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputLogin
              type="number"
              name="price_per_night"
              value={formData.price_per_night}
              onChange={handleChange}
              placeholder="Price per Night"
              min={0}
              step="0.01"
              required
            />
            <InputLogin
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Amenities (comma separated)"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.push("/hotels")}
              className="px-4 py-2 rounded-lg border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#035280] text-white disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}