"use client";
import { useForm } from "../../context/FormContext";
import { useAuth } from "../../context/AuthContext";
import { signUp } from "../../utils/auth";
import { useRouter } from "next/navigation";
import InputLogin from "@/app/components/inputLogin";
import CustomDropdown from "@/app/Dashboard/Components/DropDown";

export default function MoreInfo() {
  const { formData, setFormData } = useForm();
  const { setIsAuthenticated } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };
  const handleDropChange1 = (value) => {
    setFormData({ ...formData, gender: value });
  };
  const handleDropChange2 = (value) => {
    setFormData({ ...formData, favorite_currency: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    

    // Validate password requirements
    
    try {
      const response = await signUp(formData);
      console.log(response)
      if (response.ok) {
        setIsAuthenticated(true);
        alert("Sign-up successful!");
        router.push("/");
      } else {
        // Handle specific errors from the backend
        if (!response.ok) {
           
        router.push("/Sign/Sign_up")
        
        alert("Sign-up failed. Please try again."+ response.error);
        }
      }
    } catch (error) {
      alert(error.message)
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
            backgroundColor="var(--bg-color)"
          />
          <InputLogin
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            backgroundColor="var(--bg-color)"
          />
          <InputLogin
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            backgroundColor="var(--bg-color)"
          />
          <InputLogin
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            backgroundColor="var(--bg-color)"
          />

          {/* Birthdate Input */}
          <InputLogin
            type="date"
            name="birthdate"
            placeholder="Birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            backgroundColor="var(--bg-color)"
          />

          
          {/* Gender Select Dropdown */}
          <CustomDropdown
            options={[{label: "Male", value: "male"}, {label: "Female", value: "female"}]}
            value={formData.gender}
            onChange={handleDropChange1}
            placeholder="Select Gender"
          />

          {/* Favorite Currency Select Dropdown */}
          <CustomDropdown
            options={[{label: "USD", value: "USD"}, {label: "EUR", value: "EUR"}, {label: "GBP", value: "GBP"}]}
            value={formData.favorite_currency}
            onChange={handleDropChange2}
            placeholder="Select Favorite Currency"
          />  
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full font-bold py-4 text-lg rounded-md bg-[var(--secondary)] text-black"
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
