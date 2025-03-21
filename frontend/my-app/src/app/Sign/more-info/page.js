// app/sign/more-info/page.js
"use client";
import InputLogin from "../../components/inputLogin";
import { useForm } from "../../context/FormContext"; // Import the useForm hook
import { useRouter } from "next/navigation";  // Import useRouter for redirection

export default function MoreInfo() {
  const { formData, setFormData } = useForm(); // Use the form context
  const router = useRouter(); // Initialize the router

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value, // Update the specific field in the state
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data for the backend
    const userData = {
      username: formData.username,
      email: formData.email,
      phone_number: formData.phone_number,
      password: formData.password,
    };

    const customerData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      country: formData.country,
      city: formData.city,
      birthdate: formData.birthdate,
      profile_picture: formData.profile_picture,
      gender: formData.gender,
      favorite_currency: formData.favorite_currency,
    };

    try {
      // Send the data to the backend
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userData, ...customerData }),
      });

      if (response.ok) {
        router.push("/dashboard"); // Redirect to the dashboard on success
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 justify-center items-center">
      {/* Header Section */}
      <div className="w-full flex flex-col justify-center items-start gap-4">
        <h1 className="text-black text-4xl font-bold">More Info</h1>
        <p>
          Please provide additional information to complete your registration.
        </p>
      </div>

      {/* More Info Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-end gap-6 rounded-lg">
        <div className="w-full grid grid-cols-2 grid-rows-2 gap-4">
          {[
            { type: "text", name: "first_name", placeholder: "First Name" },
            { type: "text", name: "last_name", placeholder: "Last Name" },
            { type: "text", name: "country", placeholder: "Country" },
            { type: "text", name: "city", placeholder: "City" },
            { type: "date", name: "birthdate", placeholder: "Birthdate" },
            { type: "text", name: "gender", placeholder: "Gender" },
            { type: "text", name: "favorite_currency", placeholder: "Favorite Currency" },
          ].map((el, index) => (
            <InputLogin
              key={index}
              type={el.type}
              name={el.name}
              placeholder={el.placeholder}
              value={formData[el.name]}
              onChange={handleChange}
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full font-bold py-4 text-lg rounded-md bg-[#ED881F] text-black"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}