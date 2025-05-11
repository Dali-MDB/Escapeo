"use client";

import { API_URL } from "@/app/utils/constants";
import { useState } from "react";
import CustomDropdown from "../Components/DropDown";
import InputLogin from "../Components/InputLogin";

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
        gender: "",
        join_date: "",
        date_of_birth: "",
        department: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (["username", "email", "phone_number", "password"].includes(name)) {
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

    const handleGenderSelect = (selectedOption) => {
        setFormData({
            ...formData,
            gender: selectedOption
        });
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
            // Prepare data for submission
            const submissionData = {
                user: {
                    username: formData.user.username,
                    email: formData.user.email,
                    phone_number: formData.user.phone_number,
                    password: formData.user.password
                },
                first_name: formData.first_name,
                last_name: formData.last_name,
                country: formData.country,
                city: formData.city,
                years_of_experience: formData.years_of_experience,
                gender: formData.gender,
                join_date: formData.join_date,
                date_of_birth: formData.date_of_birth,
                department: formData.department
            };
            console.log(JSON.stringify(submissionData)
            )
            console.log(`Bearer ${localStorage.getItem('accessToken')}`)
            // Submit to your API endpoint  
            const response = await fetch(`${API_URL}/add_admin/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create admin");
            }

            const result = await response.json();
            alert("Admin created successfully!");

            // Reset form
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
                gender: "",
                join_date: "",
                date_of_birth: "",
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
        {
            name: "username",
            type: "text",
            required: true,
            placeholder: "Enter username",
            icon: (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            name: "email",
            type: "email",
            required: true,
            placeholder: "Enter email address",
            icon: (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: "phone_number",
            type: "tel",
            required: false,
            placeholder: "Enter phone number",
            icon: (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            )
        },
        {
            name: "password",
            type: "password",
            required: true,
            placeholder: "Enter password",
            icon: (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            name: "first_name",
            type: "text",
            required: true,
            placeholder: "Enter first name"
        },
        {
            name: "last_name",
            type: "text",
            required: true,
            placeholder: "Enter last name"
        },
        {
            name: "country",
            type: "text",
            required: false,
            placeholder: "Enter country"
        },
        {
            name: "city",
            type: "text",
            required: false,
            placeholder: "Enter city"
        },
        {
            name: "years_of_experience",
            type: "number",
            required: false,
            placeholder: "Enter years of experience"
        },
        {
            name: "join_date",
            type: "date",
            required: false,
            placeholder: "Join Date"
        },
        {
            name: "date_of_birth",
            type: "date",
            required: false,
            placeholder: "Date of birth"
        },
        {
            name: "department",
            type: "text",
            required: true,
            placeholder: "Enter department"
        },
        {
            name: "gender",
            type: "dropdown",
            required: true,
            placeholder: "Select your gender"
        }
    ];

    return (
        <div className="rounded-xl w-2/3 mx-auto p-6 bg-[var(--bg-color)] shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Add New Admin</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 items-center">
                {fields.map((field, index) => (
                    <div key={index} className={field.type === "dropdown" ? "col-span-2" : ""}>
                        {field.type === "dropdown" ? (
                            <CustomDropdown
                                name="gender"
                                options={[
                                    { label: "Male", value: "male" },
                                    { label: "Female", value: "female" },
                                ]}
                                selectedValue={formData.gender}
                                onChange={handleGenderSelect}
                                placeholder={field.placeholder}
                            />
                        ) : (
                            <InputLogin
                                type={field.type}
                                name={field.name}
                                value={
                                    ["username", "email", "phone_number", "password"].includes(field.name)
                                        ? formData.user[field.name]
                                        : formData[field.name]
                                }
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                icon={field.icon}
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
                    className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${isSubmitting ? "bg-[var(--secondary)] cursor-not-allowed" : "bg-[var(--primary)] hover:opacity-80"
                        } col-span-2`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        "Add Admin"
                    )}
                </button>
            </form>
        </div>
    );
}