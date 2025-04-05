"use client";
import { staysDest , stays } from "../data/data";
import NavBar from "../components/NavBar";
import Image from "next/image";
import UniqueStayCard from "../UniqueStaysCard";

import { useState } from "react";
import {
  calendarIcon,
  searchIcon,
  filtersIcon,
  staysIcon,
  services,
  personIcon,
  BigOffers,
} from "../data/data";

import Link from "next/link";
const PackageLilCard = (props) => {
  return (
    <div className="group relative rounded-[50px] min-w-72 min-h-[350px] text-white flex flex-col justify-end items-center  transition-transform duration-300 ease-out hover:-translate-y-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 rounded-[50px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${props.backgroundImage})`,
        }}
      ></div>

      {/* Semi-transparent Overlay */}
      <div className="absolute inset-0 rounded-[50px] bg-black bg-opacity-30"></div>

      {/* Card Details */}
      <div className="relative z-10 flex flex-col justify-end items-center pb-10 w-full">
        {/* Title */}
        <p className="text-2xl font-semibold text-center">{props.title}</p>

        {/* Description and Price */}
      </div>

      {/* Button */}
      <button className="absolute z-10 left-1/2 translate-y-[150%] -translate-x-1/2 w-1/3 font-bold rounded-full bg-[#F38B1E] text-black  py-2 px-1 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-[50%] group-hover:opacity-100">
        <Link href={props.link}>See more</Link>
      </button>

      {/* Hover Effects */}
      <div className="absolute inset-0 border-2 border-transparent rounded-[50px] transition-all duration-300 ease-out group-hover:border-[#008bf8] group-hover:shadow-[0_4px_18px_0_rgba(0,0,0,0.25)]"></div>
    </div>
  );
};

const FlightsSearch = () => {
  const [choice, setChoice] = useState("Round Trip");

  return (
    <div className="cursor-pointer text-center shadow-[10px_10px_35px_0_#a4b5c4] z-2 mt-[-5%] flex flex-col justify-between gap-5 items-start w-full text-lg text-black py-3 px-10 pb-10 bg-gray-100 rounded-2xl">
      {/* Tabs */}
      <div className="flex p-0 gap-4 border-b mb-2">
        <div
          className={`flex h-full justify-center items-center gap-2 px-2  py-5 ${
            choice === "Round Trip" ? "shadow-[inset_0_-4px_0_black]" : ""
          }`}
          onClick={() => {
            setChoice("Round Trip");
          }}
        >
          Round Trip
        </div>
        <div
          className={`flex h-full justify-center items-center gap-2 px-0  py-5 cursor-pointer ${
            choice === "One-way trip" ? "shadow-[inset_0_-4px_0_black]" : ""
          }`}
          onClick={() => {
            setChoice("One-way trip");
          }}
        >
          One-way trip
        </div>
      </div>
      <div className="flex flex-row justify-evenly gap-5 items-center w-full">
        {/* Fieldset for From - To */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-md text-left px-2 flex justify-between items-center gap-2">
            Enter Destination
          </legend>
          <div className="flex gap-5 py-3 flex-row  items-center justify-between w-full">
            <input className="h-full w-full rounded-sm bg-transparent text-lg outline-none" />{" "}
            {staysIcon}
          </div>
        </fieldset>

        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-md text-left px-2 flex justify-between items-center gap-2">
            Check In
          </legend>
          <div className="flex  gap-5 py-3 flex-row items-center justify-between w-full">
            <input className="h-full w-full rounded-sm bg-transparent text-lg outline-none" />{" "}
            {calendarIcon}
          </div>
        </fieldset>
        {!(choice === "One-way trip") && (
          <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
            <legend className="text-md text-left px-2 flex justify-between items-center gap-2">
              Check Out
            </legend>
            <div className="flex  gap-5 py-3 flex-row items-center justify-between w-full">
              <input className="h-full w-full rounded-sm bg-transparent text-lg outline-none" />{" "}
              {calendarIcon}
            </div>
          </fieldset>
        )}

        {/* Fieldset for Passenger - Class */}
        <fieldset className="w-full border-[1px] border-[#4B6382] rounded-md px-4 focus-within:border-[#4B6382]">
          <legend className="text-md px-2 text-left ">Rooms & Guests</legend>
          <div className="flex p-2 gap-5 py-3 flex-row items-center justify-between w-2/3">
            {personIcon}
            <input className="h-full w-full rounded-sm bg-transparent outline-none" />
          </div>
        </fieldset>
        <div className="w-[28%] flex flex-row items-center justify-center mt-4 gap-5 h-full">
          <div className="w-full bg-[#F38B1E] h-full p-3 rounded-3xl">
            {searchIcon}
          </div>
          <button className="w-full p-2 rounded-md flex items-center justify-center text-black">
            {filtersIcon}
          </button>
        </div>
      </div>
    </div>
  );
};

const Hero = () => (
  <div className="w-full  h-[60vh] sm:h-[80vh] mt-24  lg:h-screen relative   mx-auto  py-5 flex flex-col  justify-start lg:justify-center items-center  ">
    <div className="bg-no-repeat h-1/3  lg:h-3/4 w-[90%] bg-[url('/coverStays.png')] bg-center bg-cover  rounded-3xl">
      {/** */}
    </div>
    <div className="absolute bottom-[-50px] w-[80%]">
      <FlightsSearch />
    </div>
  </div>
);

const StaysByActivitySection = () => {
  const bg = "/bg.png";
  return (
    <section
      className=" h-[100vh] flex justify-center  items-center w-full mx-auto mt-16"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover", // Ensures the image covers the entire section
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
      }}
    >
      <div className="w-[80%] mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-5xl font-bold py-4">
              Find your new favourite stay
            </h2>
            <p className="text-xl">
              Discover the best activities our stays offer{" "}
            </p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-3xl py-3 px-3">
            See All
          </button>
        </div>

        {/* Scrolling Container */}
        <div className="relative overflow-y-hidden w-full text-white overflow-x-auto no-scrollbar py-6 mt-9">
          <div className="flex space-x-10 w-[calc(4.5*300px)] snap-x scroll-smooth">
            {services.map((pack, index) => (
              <PackageLilCard
                key={index}
                backgroundImage={pack.bgImg}
                link={pack.link}
                title={pack.title}
                description={pack.description}
                oldPrice={pack.prevPrice}
                newPrice={pack.newPrice}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StaysInPopDest = (props) => (
  <div className="group relative rounded-3xl min-w-80 min-h-[320px] text-white flex flex-col justify-end items-center  transition-transform duration-300 ease-out hover:-translate-y-4">
    {/* Background Image */}
    <div
      className="absolute inset-0 rounded-3xl bg-cover bg-center"
      style={{
        backgroundImage: `url(${props.bgImg})`,
      }}
    ></div>

    {/* Semi-transparent Overlay */}
    <div className="absolute inset-0 rounded-3xl bg-black bg-opacity-30"></div>

    {/* Card Details */}
    <div className="relative z-10 flex flex-col justify-evenly gap-2 items-center p-6 w-full">
      {/* Title */}
      <div className="flex justify-start items-end w-full px-0">
        <p className="text-2xl font-semibold text-left">{props.title}</p>
      </div>

      {/* Description and Price */}
      <div className="flex justify-between items-center w-full gap-2">
        <div className="flex flex-col items-center justify-between w-full">
          <p className="w-full">{props.description}</p>
          <p className="w-full">avg. nightly price</p>
        </div>
        <div className="flex flex-col items-end justify-center w-1/3">
          <span className="text-xl text-white">{`$ ${props.Price}`}</span>
        </div>
      </div>
    </div>

    {/* Button */}

    {/* Hover Effects */}
    <div className="absolute inset-0 border-2 border-transparent rounded-3xl transition-all duration-300 ease-out group-hover:border-[#008bf8] group-hover:shadow-[0_4px_18px_0_rgba(0,0,0,0.25)]"></div>
  </div>
);

function StaysDestSect() {
  return (
    <section className=" h-[80vh] flex justify-center mt-[-45px] items-center w-full mx-auto">
      <div className="w-[80%] mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-5xl font-bold py-4">
              Explore stays in popular destinations
            </h2>
            <p className="text-xl">
              Discover our hottest hotels deals right now{" "}
            </p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-3xl py-3 px-3">
            See All
          </button>
        </div>

        {/* Scrolling Container */}
        <div className="relative w-full overflow-x-auto no-scrollbar py-6 mt-2">
          <div className="flex space-x-10 w-[calc(4.5*300px)] snap-x scroll-smooth">
            {staysDest.map((offer, index) => (
              <StaysInPopDest key={index} {...offer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const LastMinuteDeals = () => {
  const bg = "/bg.png";
  return (
    <section
      className=" min-h-[110vh]  flex justify-center  items-center w-full mx-auto mt-16 py-12"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover", // Ensures the image covers the entire section
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
      }}
    >
      {" "}
      <div className="w-[80%] mx-auto mt-12 ">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-5xl font-bold py-4">
              Top deals for a last minute gateway
            </h2>
            <p className="text-xl">
              Discover our hottest hotels deals right now{" "}
            </p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-lg py-3 px-3">
            See All
          </button>
        </div>

        {/* Scrolling Container */}
        <div className="relative w-full mb-12 overflow-x-auto no-scrollbar py-6 mt-9">
          <div className="flex space-x-10 w-[calc(4.5*300px)] snap-x scroll-smooth">
            {BigOffers.map((offer, index) => (
              <div
                key={index}
                className="relative min-h-[550px] min-w-96 rounded-2xl shadow-lg flex flex-col justify-end items-center  transition-transform duration-300 ease-out hover:-translate-y-4 p-6 text-white shrink-0 snap-start"
                style={{
                  backgroundImage: `url(${offer.bgImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Text Overlay */}
                <div className="w-full text-left px-2  pb-4 flex flex-row justify-between items-center ">
                  <div className="flex flex-col w-full h-full">
                    <p className="text-xl w-full font-bold">{offer.location}</p>
                    <p className="text-sm text-gray-300">{offer.description}</p>
                  </div>
                  <div className="flex flex-col items-end justify-center w-full h-full">
                    <span className="text-lg opacity-50 line-through">{`$ ${offer.prevPrice}`}</span>
                    <span className="text-xl text-white">{`$ ${offer.newPrice}`}</span>
                  </div>
                </div>
                <button className="block w-full bg-[#F38B1E] px-4 py-3 rounded-xl text-black">
                  Book flight
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};




const UniqueStaysSec = () => {
  
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-10">
       <div className="w-[80%] mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-5xl font-bold py-4">
            Explore these unique stays
            </h2>
            <p className="text-xl">
            Discover our most famous hotels   </p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-3xl py-3 px-3">
            See All
          </button>
        </div>
      </div>
    <div className="w-[80%] mx-auto flex gap-16 flex-row justify-evenly items-center ">
      {stays.slice(1,4).map((stay, index) => (
        <UniqueStayCard key={index} h="680px" h2="300px" w='96' {...stay} />
      ))}
    </div></div>
  );
};

const Hotels = () => (
  <div className="bg-[#EEDAC4] py-5">
    <NavBar />
    <Hero />
    <StaysByActivitySection />
    <StaysDestSect />
    <LastMinuteDeals />
    <UniqueStaysSec />
  </div>
);

export default Hotels;
