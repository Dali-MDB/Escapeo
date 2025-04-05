import Image from "next/image";
import { time, gate, seat } from "@/app/Setting/data";

const LogoSection = ({  airwaysLogo  }) => (
  <div className="w-1/3 h-full flex items-center justify-center">
    <Image
      alt=""
      width={100}
      height={100}
      className="w-16"
      src={airwaysLogo }
    />
  </div>
);

const FlightInfo = ({ departAirport, departHour, arrivalAirport, arrivalHour }) => (
  <div className="h-full text-center w-2/3 px-6 flex flex-row items-center">
    <span className="w-full h-full flex flex-col justify-between items-center">
      <p className="text-xl w-full">{departAirport}</p>
      <h1 className="w-full text-xl font-extrabold">{departHour}</h1>
    </span>
    <span className="w-full h-full flex flex-col justify-center items-center">-</span>
    <span className="w-full h-full flex flex-col justify-between items-center">
      <p className="text-xl w-full">{arrivalAirport}</p>
      <h1 className="w-full text-xl font-extrabold">{arrivalHour}</h1>
    </span>
  </div>
);


const DetailsSection = ({ choice, date, gateNo, flightTime, seatNo, checkiinTime, checkioutTime }) => (
  <div className="w-2/3 h-full grid grid-cols-2 gap-3 grid-rows-1 justify-items-center place-items-center">
      <>
        <DetailItem icon={time} label="Date" value={date} />
        <DetailItem icon={time} label="Flight time" value={flightTime} />
      </>
    
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="w-full flex flex-row gap-2 justify-between items-center">
    <span>{icon}</span>
    <span className="w-full ">
      <p className="text-md w-full">{label}</p>
      <h1 className="w-full text-xl font-bold">{value}</h1>
    </span>
  </div>
);


const FlightBox = (props) => (
  <div className="w-full shadow-md py-6  gap-2 flex flex-row justify-center items-center bg-transparent rounded-xl">
    <LogoSection {...props} />
    <FlightInfo {...props} /> 
    <DetailsSection {...props} />
  </div>
);

export default FlightBox;
