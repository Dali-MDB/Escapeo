// context/FormContext.js
"use client";
import { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    // User fields
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",

    // Customer fields
    first_name: "",
    last_name: "",
    country: "",
    city: "",
    birthdate: "",
    profile_picture: "",
    gender: "",
    favorite_currency: "",
  });

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);