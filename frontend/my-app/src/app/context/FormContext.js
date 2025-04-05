"use client"

import { createContext, useState, useContext } from "react";

// Create the context
export const FormContext = createContext(null);

// Custom hook to use the FormContext
export function useForm() {
  return useContext(FormContext);
}

// FormProvider component
export function FormProvider({ children }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    first_name: "",
    last_name: "",
    country: "",
    city: "",
    birthdate: "",
    gender: "",
    favorite_currency: "",
    profile_picture: null,
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  return (
    <FormContext.Provider value={{ formData, setFormData , loginData , setLoginData }}>
      {children}
    </FormContext.Provider>
  );
}