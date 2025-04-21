"use client";

const UniqueStayCard = (props) => {
  const { bgImg, hotelName, country, red, price, date } = props;

  return (
    <div className="h-full transition-all duration-200 ease-in shadow-[0px_0px_10px_7px_rgba(0,0,0,0.25)] hover:shadow-none rounded-lg overflow-hidden bg-[var(--bg-color)] w-full flex flex-col justify-start items-center pb-6">
      {/* Image Section */}
      <div
        className="w-full relative min-h-64 my-0 px-auto bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImg})` }}
      ></div>

      {/* Content Section */}
      <div className="w-[87%] h-full flex flex-col justify-center items-end mx-auto">
        {/* Hotel Name and Country */}
        <div className="w-full flex flex-col">
          <h1 className="font-bold text-2xl">{hotelName}</h1>
          <p className="text-gray-600">{country}</p>
        </div>

        {/* Discount, Price, and Button */}
        <div className="w-[95%] h-[80%] mx-auto flex flex-col justify-center gap-4 items-center">
          {/* Discount Badge */}
          <div className="w-fit py-1 px-3 text-xs text-white bg-[var(--primary)] rounded-full">
            {red}% less than usual
          </div>

          {/* Price and Date */}
          <div className="w-full flex flex-row-reverse justify-between items-center">
            <div className="w-1/2 text-right">
              <h2 className="font-bold text-xl">{price}</h2>
              <p className="text-gray-600">{date}</p>
            </div>
            <div className="w-1/2 text-left">
              <h4 className="font-semibold">About</h4>
              <p className="text-gray-600">per night</p>
            </div>
          </div>

          {/* Check Deal Button */}
          <button className="w-full rounded-lg py-2 font-semibold bg-[var(--secondary)] text-white hover:bg-[#D97A1A] transition-colors duration-200">
            Check Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniqueStayCard;