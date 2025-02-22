import { offers } from "../data/data";

export default function SpecialOffers() {
  return (
    <section className=" h-screen flex justify-center mt-[-45px] items-center w-full mx-auto">
      <div className="w-[75%] mx-auto">
        <div className="text-black flex w-full justify-between items-center">
          <div>
            <h2 className="text-5xl font-bold py-4">Special Offer</h2>
            <p className="text-xl">
              Search Flights & Places Hire to our most popular destinations
            </p>
          </div>
          <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-lg py-3 px-3">
            See All
          </button>
        </div>

        {/* Scrolling Container */}
        <div className="relative w-full overflow-x-auto no-scrollbar py-6 mt-9">
          <div className="flex space-x-10 w-[calc(4.5*300px)] snap-x scroll-smooth">
            {offers.map((offer, index) => (
              <div
                key={index}
                className="relative h-[450px] w-80 rounded-2xl shadow-lg flex flex-col justify-end items-center p-6 text-white shrink-0 snap-start"
                style={{
                  backgroundImage: `url(${offer.bgImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Text Overlay */}
                <div className="w-full text-left px-2  pb-4 flex flex-row justify-between items-center ">
                  <div className="flex flex-col w-full h-full">
                    <p className="text-xl w-full font-bold">
                      {offer.location}
                    </p>
                    <p className="text-sm text-gray-300">{offer.description}</p>
                  </div>
                  <div className="flex flex-col items-end justify-center w-full h-full">
                    <span className="text-lg opacity-50 line-through">{`$ ${offer.prevPrice}`}</span>
                    <span className="text-xl text-white">{`$ ${offer.newPrice}`}</span>
                  </div>
                </div>
                <button className="block w-full bg-[#A4B5C4] px-4 py-3 rounded-xl text-black">Book flight</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
