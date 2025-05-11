import { StarIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
function StayBox({ hotel }) {
  // Extract the first image if available
  const firstImage = hotel?.images.length > 0
    && hotel?.images[0].image
  return (
    <div className="group relative rounded-xl w-72 h-[400px] text-white flex flex-col justify-end items-center transition-transform duration-300 ease-out hover:-translate-y-4">
      {/* Background Image */}
      <div className="absolute h-full w-full rounded-[50px] overflow-hidden">

        {firstImage && <Image
          width={290}
          height={290}
          alt={hotel?.name}
          unoptimized
          src={firstImage.startsWith('http') ? firstImage : `http://127.0.0.1:8000${firstImage}`}
          className="w-full h-full object-cover"
        />
        } </div>

      {/* Semi-transparent Overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-[50px] bg-black bg-opacity-20"></div>

      {/* Card Details */}
      <div className="relative z-10 flex flex-col justify-evenly gap-4 items-center p-6 w-full">
        {/* Title and Rating */}
        <div className="flex flex-col  justify-center items-start w-full ">
          <p className="text-2xl font-semibold text-[var(--bg-color)]">{hotel?.name}</p>
          <p className="text-white text-lg">{hotel?.location}</p>
        </div>

        {/* Amenities */}
        <div className="w-full flex justify-between items-center">
          <p className="text-md w-full text-white line-clamp-2">
            {hotel?.amenities.split(',').slice(0, 3).map(amenity => (
              <span key={amenity.trim()} className="mr-2">• {amenity}</span>
            ))}
          </p>
          <p className="w-fit  flex items-center justify-end ">{<StarIcon size={12} fill="yellow" color="yellow" />}{hotel?.stars_rating}</p>
        </div>

        {/* Price */}
        <div className="w-full flex justify-between items-center mt-2">
          <div className="text-sm">
            <span className="text-lg font-bold">{hotel?.price_per_night} $</span>
            <span className="text-sm font-semibold opacity-80">/night</span>
          </div>
          <span className="text-xs">
            {hotel?.total_rooms - hotel?.total_occupied_rooms} rooms available
          </span>
        </div>
      </div>

      {/* Button */}
      <button
      onClick={()=>{
        localStorage.setItem("selectedStay" , hotel.id)
      }}
      className="absolute z-10 left-1/2 translate-y-[150%] -translate-x-1/2 w-1/3 font-bold rounded-full bg-[#F38B1E] text-black py-2 px-1 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-[50%] group-hover:opacity-100">
        <Link href={`/Hotel_Info`}>Book Now</Link>
      </button>

      {/* Hover Effects */}
      <div className="absolute inset-0 border-2 border-transparent rounded-[50px] transition-all duration-300 ease-out group-hover:border-[#008bf8] group-hover:shadow-[0_4px_18px_0_rgba(0,0,0,0.25)]"></div>
    </div>
  );
}

export default StayBox