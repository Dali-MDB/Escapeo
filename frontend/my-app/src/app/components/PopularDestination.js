import { destPop } from "../data/data";

export default function PopularDest() {
  const bg = '/bg.png'; // Ensure this path is correct and the image exists in the public folder

  return (
    <section
      className="relative h-screen w-full flex justify-center mt-32 sm:mt-16 items-center mx-auto"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover", // Ensures the image covers the entire section
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
      }}
    >
      <div className="w-[80%] z-10 mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold py-4">Popular Destinations</h2>
            <p className="text-lg sm:text-xl">
              Search Flights & Places Hire to our most popular destinations
            </p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-lg py-3 px-3 hover:bg-black hover:text-white transition-colors duration-300">
            See more places
          </button>
        </div>

        {/* Scrolling Container */}
        <div className="relative w-full overflow-x-auto no-scrollbar py-6 mt-9">
          <div className="flex space-x-10 w-[calc(4.5*390px)] snap-x scroll-smooth">
            {destPop.map((dest, index) => (
              <div
                key={index}
                className="relative h-[320px] w-[390px] rounded-2xl shadow-lg flex items-end p-4 text-white shrink-0 snap-start transition-transform "
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.01)), url(${dest.bgImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Text Overlay */}
                <div className="w-full text-center px-2 pb-4">
                  <p className="text-4xl w-full font-semibold">
                    {dest.location}
                  </p>
                  <p className="text-sm text-gray-300">
                    Flights · Hotels · Resorts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}