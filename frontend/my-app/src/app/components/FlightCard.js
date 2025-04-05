export default function FlightCard(props){
    return (<div
        className="relative h-full min-h-96 w-full rounded-2xl shadow-lg flex flex-col justify-end items-center  transition-transform duration-300 ease-out hover:-translate-y-4 py-4 px-2 text-white shrink-0 snap-start"
        style={{
          backgroundImage: `url(${props.bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Text Overlay */}
        <div className="w-full text-left px-2  pb-4 flex flex-row justify-between items-center ">
          <div className="flex flex-col w-full h-full">
            <p className="text-xl w-full font-bold">
              {props.location}
            </p>
            <p className="text-sm text-gray-300">{props.description}</p>
          </div>
          <div className="flex flex-col items-end justify-center w-full h-full">
            <span className="text-lg opacity-50 line-through">{`$ ${props.prevPrice}`}</span>
            <span className="text-xl text-white">{`$ ${props.newPrice}`}</span>
          </div>
        </div>
        <button className="block w-full bg-[#F38B1E] px-4 py-3 rounded-xl text-black">Book flight</button>
      </div>)
}