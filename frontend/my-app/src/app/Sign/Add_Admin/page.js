"use client";

import { API_URL } from "@/app/utils/constants";
import { useState } from "react";

export default function AddAdmin() {
  const [formData, setFormData] = useState({
    user: {
      username: "",
      email: "",
      phone_number: "",
      password: ""
    },
    first_name: "",
    last_name: "",
    country: "",
    city: "",
    years_of_experience: "",
    profile_picture: null,
    gender: "",
    join_date: "",
    department: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "profile_picture") {
      setFormData({
        ...formData,
        [name]: e.target.files[0]
      });
    } else if (["username", "email", "phone_number", "password"].includes(name)) {
      setFormData({
        ...formData,
        user: {
          ...formData.user,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate user fields
    if (!formData.user.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.user.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.user.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.user.password) {
      newErrors.password = "Password is required";
    } else if (formData.user.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Validate other required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const data = new FormData();
      
      // Append user data
      data.append("username", formData.user.username);
      data.append("email", formData.user.email);
      data.append("phone_number", formData.user.phone_number);
      data.append("password", formData.user.password);
      
      // Append admin data
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("country", formData.country);
      data.append("city", formData.city);
      data.append("years_of_experience", formData.years_of_experience);
      data.append("gender", formData.gender);
      data.append("join_date", formData.join_date);
      data.append("department", formData.department);
      
      if (formData.profile_picture) {
        data.append("profile_picture", formData.profile_picture);
      }

      // Submit to your API endpoint
      const response = await fetch(`${API_URL}/add_admin/`, {
        method: "POST",
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create admin");
      }

      const result = await response.json();
      alert("Admin created successfully!");
      // Reset form or redirect as needed
      setFormData({
        user: {
          username: "",
          email: "",
          phone_number: "",
          password: ""
        },
        first_name: "",
        last_name: "",
        country: "",
        city: "",
        years_of_experience: "",
        profile_picture: null,
        gender: "",
        join_date: "",
        department: ""
      });

    } catch (error) {
      console.error("Error creating admin:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "username", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone_number", type: "tel", required: false },
    { name: "password", type: "password", required: true },
    { name: "first_name", type: "text", required: true },
    { name: "last_name", type: "text", required: true },
    { name: "country", type: "text", required: false },
    { name: "city", type: "text", required: false },
    { name: "years_of_experience", type: "number", required: false },
    { name: "profile_picture", type: "file", required: false },
    { name: "gender", type: "select", options: ["", "M", "F"], required: false },
    { name: "join_date", type: "date", required: false },
    { name: "department", type: "text", required: true }
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Add New Admin</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.name.replace("_", " ")}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option || "Select..."}
                  </option>
                ))}
              </select>
            ) : field.type === "file" ? (
              <input
                type="file"
                name={field.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={
                  ["username", "email", "phone_number", "password"].includes(field.name)
                    ? formData.user[field.name]
                    : formData[field.name]
                }
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors[field.name] ? "border-red-500" : "border-gray-300"
                }`}
                required={field.required}
              />
            )}
            
            {errors[field.name] && (
              <p className="text-red-500 text-sm">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white ${
            isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Add Admin"}
        </button>
      </form>
    </div>
  );
}