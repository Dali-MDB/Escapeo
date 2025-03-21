"use client";
import { useForm } from "../../context/FormContext";
import { useAuth } from "../../context/AuthContext";
import { signUp } from "../../utils/auth";
import { useRouter } from "next/navigation";
import InputLogin from "@/app/components/inputLogin";
export default function MoreInfo() {
  const { formData, setFormData } = useForm();
  const { setIsAuthenticated } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signUp(formData);
      setIsAuthenticated(true);
      alert("Registration successful!");
      router.push("/");
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className="w-3/4 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
      {/* Header Section */}
      <div className="w-full flex flex-col justify-center items-start gap-4">
        <h1 className="text-black text-4xl font-bold">More Info</h1>
        <p>
          Please provide additional information to complete your registration.
        </p>
      </div>

      {/* More Info Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-end gap-6 rounded-lg"
      >
        <div className="w-full grid grid-cols-2 grid-rows-2 gap-4">
          {/* Text Inputs */}
          <InputLogin
            type="text"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
          />
          <InputLogin
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
          />
          <InputLogin
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
          />
          <InputLogin
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />

          {/* Birthdate Input */}
          <InputLogin
            type="date"
            name="birthdate"
            placeholder="Birthdate"
            value={formData.birthdate}
            onChange={handleChange}
          />

          {/* Profile Picture Upload */}
          <input
            type="file"
            name="profile_picture"
            accept="image/*"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* Gender Select Dropdown */}
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Gender</option>
            <option value="male">M</option>
            <option value="female">F</option>
          </select>

          {/* Favorite Currency Select Dropdown */}
          <select
            name="favorite_currency"
            value={formData.favorite_currency}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Currency</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="DZD">DZD</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full font-bold py-4 text-lg rounded-md bg-[#ED881F] text-black"
        >
          Submit
        </button>
      </form>
    </div>
  );

}

/**
 * 
 */
