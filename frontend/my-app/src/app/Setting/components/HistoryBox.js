import Image from "next/image";
import { time, gate, seat } from "../data";

const LogoSection = ({ choice, airwaysLogo, hotelLogo }) => (
  <div className="w-1/3 h-full flex items-center justify-center">
    <Image
      alt=""
      width={100}
      height={100}
      className="w-16"
      src={choice === "Flights" ? airwaysLogo : hotelLogo}
    />
  </div>
);

const FlightInfo = ({ departAirport, departHour, arrivalAirport, arrivalHour }) => (
  <div className="h-full text-center w-2/3 px-6 flex flex-row items-center">
    <span className="w-full h-full flex flex-col justify-between items-center">
      <p className="text-md w-full">{departAirport}</p>
      <h1 className="w-full text-lg font-extrabold">{departHour}</h1>
    </span>
    <span className="w-full h-full flex flex-col justify-center items-center">-</span>
    <span className="w-full h-full flex flex-col justify-between items-center">
      <p className="text-md w-full">{arrivalAirport}</p>
      <h1 className="w-full text-lg font-extrabold">{arrivalHour}</h1>
    </span>
  </div>
);

const HotelInfo = ({ checkinDate, checkoutDate }) => (
  <div className="h-full text-center w-2/3 px-6 flex flex-row justify-center items-center">
    <span className="w-full h-full flex flex-col justify-between items-center">
      <p className="text-md w-full">Check-In</p>
      <h1 className="w-full text-lg font-bold">{checkinDate}</h1>
    </span>
    <span className="w-full h-full flex flex-col justify-center items-center">-</span>
    <span className="w-full h-full flex flex-col justify-center items-start">
      <p className="text-md w-full">Check-Out</p>
      <h1 className="w-full text-lg font-bold">{checkoutDate}</h1>
    </span>
  </div>
);

const DetailsSection = ({ choice, date, gateNo, flightTime, seatNo, checkiinTime, checkioutTime }) => (
  <div className="w-2/3 h-full grid grid-cols-2 gap-3 grid-rows-2 justify-items-center place-items-center">
    {choice === "Flights" ? (
      <>
        <DetailItem icon={time} label="Date" value={date} />
        <DetailItem icon={gate} label="Gate" value={gateNo} />
        <DetailItem icon={time} label="Flight time" value={flightTime} />
        <DetailItem icon={seat} label="Seat no." value={seatNo} />
      </>
    ) : (
      <>
        <DetailItem icon={time} label="Check-In time" value={checkiinTime} />
        <DetailItem icon={time} label="Check-Out time" value={checkioutTime} />
        <DetailItem icon={gate} label="Room no." value="On arrival" />
      </>
    )}
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="w-full flex flex-row gap-2 justify-between items-center">
    <span>{icon}</span>
    <span className="w-full ">
      <p className="text-sm w-full">{label}</p>
      <h1 className="w-full text-md font-bold">{value}</h1>
    </span>
  </div>
);

const ActionButtons = () => (
  <div className="w-2/3 h-full flex flex-row justify-center gap-5 items-center">
    <button className="rounded-md h-full bg-[#F38B1E] text-black p-4">Download Ticket</button>
    <button className="rounded-md border-[1px] flex justify-center border-[#F38B1E] p-4 h-full">
      <svg xmlns="http://www.w3.org/2000/svg" width={14} height={20} viewBox="0 0 12 24">
        <path fill="#000" fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414" />
      </svg>
    </button>
  </div>
);

const HistoryBox = (props) => (
  <div className="w-full py-6 px-4 gap-2 flex flex-row justify-center items-center bg-[var(--bg-color)] rounded-xl">
    <LogoSection {...props} />
    {props.choice === "Flights" ? (
      <FlightInfo {...props} />
    ) : (
      <HotelInfo {...props} />
    )}
    <DetailsSection {...props} />
    <ActionButtons />
  </div>
);

export default HistoryBox;
