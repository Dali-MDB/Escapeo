import { destPop } from "../data/data";

export default function PopularDest() {
  
  return (
    <section className=" h-screen flex justify-center mt-6 items-center w-full mx-auto">
      <div className="w-[75%] mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-5xl font-bold py-4">Popular Destinations</h2>
            <p className="text-xl">
              Search Flights & Places Hire to our most popular destinations
            </p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-lg py-3 px-3">
            See more places
          </button>
        </div>

        {/* Scrolling Container */}
        <div className="relative w-full overflow-x-auto no-scrollbar py-6 mt-9">
          <div className="flex space-x-10 w-[calc(4.5*300px)] snap-x scroll-smooth">
            {destPop.map((dest, index) => (
              <div
                key={index}
                className="relative h-[320px] w-[350px] rounded-2xl shadow-lg flex items-end p-4 text-white shrink-0 snap-start transition-transform duration-300 ease-out hover:-translate-y-4"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.01)), url(${dest.bgImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Text Overlay */}
                <div className="w-full text-center px-2  pb-4">
                  <p className="text-4xl w-full font-semibold">
                    {dest.location}
                  </p>
                  <p className="text-sm text-gray-300">
                    Flights · Hotels · Resorts
                  </p>
                </div>
                <div className="absolute inset-0 border-2 border-transparent rounded-[50px] transition-all duration-300 ease-out group-hover:border-[#008bf8] group-hover:shadow-[0_4px_18px_0_rgba(0,0,0,0.25)]"></div>
  
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
