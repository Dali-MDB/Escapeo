"use client";
import { useRef, useEffect, useState } from "react";
import { FaFacebook, FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { arrowBack } from "../../data/data";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";


const pkey = "pk_test_51R3CiHCSrc4vf8kXGjDBCa2X5bSRjrEnIsP1fNkBv1p8Bz3uJYJMnqwyd2VlhRcMjn1hZ0rAHbPTpYHOWQX3ZbWg00DPaLxxv4"
const stripePromise = loadStripe(pkey); // Replace with your Stripe publishable key

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Create a PaymentIntent on the backend
      const response = await fetch("http://localhost:8000/api/create-payment-intent/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 1000, // $10.00 in cents
          currency: "usd",
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm the payment on the client side
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === "succeeded") {
        alert("Payment successful!");
        // Redirect to a success page or dashboard
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-end gap-6 rounded-lg">
      {/* Card Details */}
      <div className="w-full border-2 py-4 px-3 rounded-lg border-[#ed881f]">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "26px",
                color: "#ed881f",
                "::placeholder": {
                  color: "rgba(0,0,0,0.2)",
                },
                
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      {/* Remember me & Forgot Password */}
      <div className="w-full py-4 flex justify-between items-center">
        <div className="flex gap-2">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">
            Securely save my information for 1-click checkout
          </label>
        </div>
      </div>

      {/* Payment Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full font-bold py-4 text-lg rounded-md bg-[#ED881F] text-black"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {/* Error Message */}
      {error && <div className="w-full text-center text-red-500">{error}</div>}

      {/* Terms and Conditions */}
      <div className="w-full text-center text-xs">
        <p className="w-[70%] mx-auto">
          By confirming your subscription, you allow The Outdoor Inn Crowd Limited to charge your card for this payment and future payments in accordance with their terms. You can always cancel your subscription.
        </p>
      </div>
    </form>
  );
};

export default function Payment() {
  
  return (
    <div className="w-3/4 h-[80%] flex flex-col gap-10 justify-start pt-10 items-center">
    {/* Login Form */}
        {/* Header Section */}
        <div className="w-full">
          <Link href={'/Sign/Sign_up'} className="w-1/2 flex items-center gap-2 text-lg font-bold">
            {arrowBack}Go Back
          </Link>
        </div>
        <div className="w-full flex flex-col justify-center items-start gap-6">
          <h1 className="text-black text-4xl font-bold">Add a payment method</h1>
          <p>Let’s get you all set up so you can access your personal account.</p>
        </div>

        {/* Stripe Elements Wrapper */}
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </div>

  );
}