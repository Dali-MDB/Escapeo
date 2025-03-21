import NavBar from "../components/NavBar";
import Image from "next/image";
import { bgColor, bgColorOrange, packs } from "../data/data";
import Reviews from "../components/ReviewsAbout.js";
import PackageCard from "../components/PackageCard";
import Link from "next/link";
const bg = "/bg.png"; // Ensure this path is correct and the image exists in the public folder

const FirstSec = () => {
  const records = [
    {
      title: "Book With Confident",
      image: "/book-with-confident.png", // Replace with actual image path
      text: "Each trip is carefully crafted to leave you free to live in the moment and enjoy your vacation.",
    },
    {
      title: "Freedom to discover",
      image: "/freedom-to-discover.png", // Replace with actual image path
      text: "Each trip is carefully crafted to leave you free to live in the moment and enjoy your vacation.",
    },
    {
      title: "Weather Vultures",
      image: "/weather-vultures.png", // Replace with actual image path
      text: "Each trip is carefully crafted to leave you free to live in the moment and enjoy your vacation.",
    },
  ];

  return (
    <section
      className="relative h-full w-full flex justify-center mt-20 py-14 items-center mx-auto"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover", // Ensures the image covers the entire section
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
      }}
    >
      {" "}
      <div className="w-full h-[80%] flex flex-row justify-center gap-0 items-center p-10 py-32">
        <div className="w-[80%] h-full flex justify-center items-center">
          <Image
            src={"/aboutImg.png"}
            alt="about image"
            width={600}
            height={600}
          />{" "}
        </div>
        <div className="w-[80%] h-full">
          <div className="w-3/4 flex flex-col items-center justify-between gap-10">
            <h3 className="w-full text-lg font-light text-red-600">About us</h3>
            <h1 className="w-full text-black text-6xl font-semibold">
              See Destinations You’ll Love To Visit
            </h1>
            <div className="w-full">
              <p className="text-black w-[90%]">
                There are many variations of passages of Lorem Ipsum available,
                but the majority have suffered alteration in some There are many
                variations of passages of Lorem Ipsum available.
              </p>
            </div>
            <div className="w-full flex flex-col justify-start gap-5 items-center text-black">
              {records.map((rec, index) => (
                <div
                  key={index}
                  className="w-full flex flex-row justify-center items-start gap-5"
                >
                  <Image
                    className=""
                    src={rec.image}
                    alt={rec.title}
                    width={50}
                    height={50}
                  />
                  <div className="w-full">
                    <h1 className="font-semibold text-lg mb-2">{rec.title}</h1>
                    <p>{rec.text}</p>
                  </div>
                </div>
              ))}
              <div className="w-full flex justify-start">
                <button
                  className={`w-fit py-2 px-6 bg-[${bgColorOrange}] rounded-lg`}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Card = (props) => {
  return (
    <div className="group relative rounded-[50px] w-72 min-h-[450px] text-white flex flex-col justify-end items-center  transition-transform duration-300 ease-out hover:-translate-y-4">
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
      <div className="relative z-10 flex flex-col justify-evenly gap-10 items-center p-6 w-full">
        {/* Title */}
        <div className="flex justify-center items-end w-full px-8">
          <p className="text-xl font-semibold text-center">{props.title}</p>
        </div>

        {/* Description and Price */}
        <div className="flex justify-between items-center w-full gap-2">
          <p className="w-full">{props.description}</p>
          <div className="flex flex-col items-end justify-center w-1/3">
            <span className="text-lg opacity-50 line-through">{`$ ${props.oldPrice}`}</span>
            <span className="text-xl text-white">{`$ ${props.newPrice}`}</span>
          </div>
        </div>
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

const SeconfSec = () => {
  return (
    <section className="relative h-3/4 w-full flex justify-center  py-14 items-center mx-auto">
      {" "}
      <div className="w-[80%] h-[80%] flex flex-col justify-center gap-10 items-start  py-32">
        <h1 className="text-5xl text-black ">
          Tips and Tricks for Planning Your Dream Trip
        </h1>
        <div className="w-full h-full flex flex-row gap-10 justify center items-center">
          <div className="w-full h-full rounded-lg">
            <Image
              src={"/blog-img-4.png.png"}
              alt="first iamge"
              width={1024}
              height={1024}
            />
          </div>
          <div className="w-full h-[80%] grid grid-cols-2 grid-rows-2 gap-y-10 gap-x-0 justify-items-start align-start ">
            {packs.map((pack, index) => (
              <Card
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

const PersonCard = (props) => {
  return (
    <div className="w-full min-h-72  bg-transparent  flex flex-col justify evenly items-center">
      <div className=" z-10 rounded-full w-64 h-64 bg-transparent border-black border-[1px] p-4">
        <Image
          src={props.image}
          alt="person's image"
          width={500}
          height={500}
          className="rounded-full w-full h-full "
        />
      </div>
      <div className=" mt-[-20%] px-5 py-28 flex justify-center items-center w-full h-full bg-[#235784] text-white rounded-xl">
        <div className="w-full  text-center h-1/2 z-0 flex flex-col gap-2">
          <h1 className="text-[40px]">{props.name}</h1>
          <h3 className="text-xs">{props.role}</h3>
        </div>
      </div>
    </div>
  );
};

const WhoAreWe = () => {
  const persons = [
    { image: "/team-1.png.png", name: "Vasili Ilmaz", role: "Wev developper" },
    ,
    { image: "/team-2.png.png", name: "Veronica", role: "Product Engineer" },
    ,
    {
      image: "/team-3.png.png",
      name: "Lion Jhonson Ilmaz",
      role: "Wev developper",
    },
  ];

  return (

    <section
      className="relative h-full w-full flex  justify-center mt-20 py-14 items-center mx-auto"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover", // Ensures the image covers the entire section
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
      }}
    >
      {" "}
      <div className="w-full h-[80%] flex flex-col justify-center gap-0 items-center py-16">
        <div className="w-[80%] mx-auto h-[80%] flex flex-row justify-center gap-32 items-center p-10 py-32">
          {persons.map((el, index) => (
            <PersonCard key={index} {...el} index={index} />
          ))}
        </div>
        <div className="w-[80%] mx-auto h-[80%] flex flex-row justify-center gap-32 items-center pb-10">
          <button className="py-5 text-black text-2xl rounded-lg bg-[#E0DCDA] shadow-lg hover:shadow-none hover:border-[1px] hover:border-[#235784] transition-all duration-500 font-bold  px-10">View More</button>
        </div>
      </div>
    </section>
  );
};

export default function About() {
  return (
    <div className={`w-full pt-20 bg-[${bgColor}]`}>
      <NavBar />
      <FirstSec />
      <Reviews />
      <SeconfSec />
      
      <div className="w-[80%] mx-auto py-0  text-black mb-[-100px]"><h1 className="text-6xl">Discover Our Team</h1></div>
      
      <WhoAreWe />
    </div>
  );
}
