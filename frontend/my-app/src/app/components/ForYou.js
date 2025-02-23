import {  planePaper  } from "../data/data";


export default function foryou() {

const  flightsImage  = '/flightsImage.jpg'
const  hotelsImage  = '/hotelsImage.jpg'
  return (
    <section className=" h-screen flex justify-center mt-6 items-center w-full mx-auto">
      <div className="w-[75%] mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div className="w-1/2">
            <h2 className="text-5xl font-bold py-4">For You</h2>
            <p className="text-xl">
              Specially curated trips and exclusive deals tailored to your
              preferences. Explore, relax, and enjoy travel made just for you
            </p>
          </div>
        </div>

        {/* Scrolling Container */}
        <div className="relative w-full flex flex-row justify-between items-center py-6 mt-9 gap-10">
        <div
            className="relative h-[60vh] w-full rounded-2xl shadow-lg flex items-end justify-center p-4 text-white"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.01)), url(${flightsImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Text Overlay */}
            <div className="w-1/2 text-center flex flex-col justify-between gap-5 items-center px-2  pb-4">
            <p className="text-4xl w-full font-semibold">Flights</p>
              <p className="text-sm text-gray-300">
              Find the best deals on flights to your dream destinations. Fast, easy, and affordable
              </p>              <button className="w-1/2 bg-[#4B6382] rounded-md flex items-center justify-center p-2 text-white">
                          {planePaper}
                          <span> show Flights</span>
                </button>
            </div>
          </div>
          <div
            className="relative h-[60vh] w-full rounded-2xl shadow-lg flex items-end justify-center p-4 text-white "
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.01)), url(${hotelsImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Text Overlay */}
            <div className="w-1/2 text-center flex flex-col justify-between gap-5 items-center px-2  pb-4">
              <p className="text-4xl w-full font-semibold">Hotels</p>
              <p className="text-sm text-gray-300">Stay in comfort with top-rated hotels at the best prices. Book your perfect stay now
              </p>
              <button className="w-1/2 bg-[#4B6382] rounded-md flex items-center justify-center p-2 text-white">
                          {planePaper}
                          <span> show Stays</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
