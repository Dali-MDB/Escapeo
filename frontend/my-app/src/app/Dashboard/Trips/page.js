"use client";
import { flightsData, staysData } from "../data";
import FlightBox from "../Components/flightBox";
import InputLogin from "../Components/InputLogin";
import { useTrip } from "../context/tripContext";

export default function Trips() {
  const { tripData, setTripData } = useTrip();

  // Handle input changes and update context state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Define the fields you want to display in the form
  const formFields = [
    { type: "text", name: "airlineCompany", placeholder: "Airline Company" },
    { type: "date", name: "date", placeholder: "Date" },
    { type: "text", name: "from", placeholder: "From" },
    { type: "text", name: "departureTime", placeholder: "Departure Time" },
    { type: "text", name: "destination", placeholder: "Destination" },
    { type: "text", name: "arrivalTime", placeholder: "Arrival Time" }
  ];

  return (
    <div className="w-full px-2 flex flex-row-reverse gap-14">
      <div className="w-1/3 h-fit pb-6 bg-[#FEF8F5] rounded-2xl">
        <div className="px-8 py-4 w-full text-xl">
          <h1>Add a new Flight</h1>
        </div>
        <hr className="w-full h-2 " />
        <form className="w-full p-8 rounded-2xl grid grid-cols-2 grid-rows-2 place-content-center place-items-center gap-6">
          {formFields.map((field, index) => (
            <InputLogin
              key={index}
              type={field.type}
              name={field.name}
              value={tripData[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
            />
          ))}
        </form>
        <div className="flex w-full px-8 justify-end items-center">
          <div className="w-fit flex gap-5 text-xl items-center justify-between">
            <button className="w-full px-4 py-1 rounded-xl bg-transparent">
              Cancel
            </button>
            <button className="w-full px-6 py-1 rounded-xl text-white bg-blue-600">
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="w-2/3 flex flex-col justify-start items-center rounded-2xl bg-[#FEF8F5]">
        <div className="px-8 py-6 w-full text-xl">
          <h1>Created Flights</h1>
        </div>
        <hr className="w-full h-2 " />
        <div className="w-full p-8 min-h-[50vh] rounded-2xl flex flex-col justify-start items-center gap-6">
          {flightsData.map((el, index) => (
            <FlightBox key={index} {...el} onChange={handleChange} />
          ))}
        </div>
      </div>
    </div>
  );
}
