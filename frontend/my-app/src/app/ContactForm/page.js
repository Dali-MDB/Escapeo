"use client";
import { useRef, useEffect, useState } from "react";
import { FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import InputLogin from "../components/inputLogin";
import Link from "next/link";
import emailjs from 'emailjs-com';


import { useRouter } from "next/navigation";

export default function ContactForm() {

  const  router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    firstName: "",
    companyName: "",
    email: "",
    message: "",
  })


  const scrollRef = useRef(null);
  const images = ["/contactFormImg.png"];
  const handleSubmit = (e) => {
    e.preventDefault()

    setLoading(true);

    emailjs.send(
      'service_gbpmba7', // Replace with your Service ID
      'template_rywk01a', // Replace with your Template ID
      {
        from_name: form.firstName + " " + form.lastName,
        to_name: "Escapeo",
        message: form.message,
        email: form.email,
        company_name: form.companyName,
      },
      'AXN0NM8BSmKr1TVYt' // Replace with your Public Key
    )
      .then((result) => {
        setLoading(false);
        alert('Email sent successfully:', result.text);
        setForm({
          name: "",
          lastName: "",
          firstName: "",
          companyName: "",
          email: "",
          message: "",
        })

        router.push("/"); // Redirect to the home page after successful submission
      })
      .catch((error) => {
        console.error('Error sending email:', error);
      });
  }

  const handleChange = (e) => {

    const { name, value } = e.target;  
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  //  || "" Auto-scroll effect
  return (
    <div className="w-screen h-screen text-black bg-[#EEDAC4] flex flex-row-reverse justify-center items-center gap-0">
      {/* Login Form */}
      <div className="w-2/5 h-[80%] gap-10 flex flex-col  justify-center items-center">
        {/* Header Section */}
        <div className="w-3/4 flex flex-col justify-center items-start gap-4">
          <h1 className="text-black text-4xl font-bold">Get In Touch</h1>
          <p>
            Let us hear from you
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-3/4 flex flex-col items-end gap-6 rounded-lg">
          <div className="w-full grid grid-cols-2 grid-rows-1 gap-4">
            {[
              { type: "text", name: "firstName" },
              { type: "text", name: "lastName" },
            ].map((el, index) => (
              <InputLogin key={index} value={form[el.name] || "" } type={el.type} name={el.name} placeholder={el.name} onChange={handleChange} />
            ))}
          </div>
          <div className="w-full grid grid-cols-1 grid-rows-2 gap-4">
            {[
              { type: "text", name: "Company Name" },
              { type: "email", name: "Email" },
            ].map((el, index) => (
              <InputLogin key={index} value={form[el.name] || "" } type={el.type} name={el.name} placeholder={el.name} onChange={handleChange} />
            ))}
          </div>
          <div className="w-full grid grid-cols-1  grid-rows-1 h-full">
            <InputLogin value={form.message || ""} type={"text-area"} name={"message"} placeholder={"Let us Know Your thoughts"} onChange={handleChange} />

          </div>

          {/* Remember me & Forgot Password */}


          {/* Login Button */}
          <button
            type="submit"
            className="w-full font-bold py-2 rounded-md bg-[var(--secondary)] text-black"
          >
            {loading  ? "Loading...":"Send Message"}
          </button>
          <div className="w-full text-center text-xs "> <p className="w-[75%] mx-auto">
            By confirming your subscription, you allow The Outdoor Inn Crowd Limited to charge your card for this payment and future payments in accordance with their terms. You can always cancel your subscription.
          </p></div>
        </form>

      </div>

      {/* Image Scroller */}
      <div className="w-2/5 h-[80%] flex justify-center items-center">
        <div
          className="w-2/3 h-full flex rounded-3xl"
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 bg-cover bg-center rounded-3xl"
              style={{
                backgroundImage: `url(${img})`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
