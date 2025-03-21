import Image from "next/image";
import { modify, plus , arrow } from "../data";

export default function Account() {
  return (
    <div className="w-full py-0 px-2 flex flex-col gap-14">
      <div
        className="bg-[url('/coverProfile.jpg')] flex justify-end items-end   w-full h-56 rounded-2xl z-0 "
        style={{ backgroundPosition: "center", backgroundSize: "cover" }}
      >
        <div className="rounded-full w-64 h-64 p-3  mx-auto mb-[-120px] bg-[#EEDAC4] flex justify-center object-contain items-center">
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundImage: "URL('/JohnDoe.jpg')",
              backgroundSize: "cover",
            }}
          ></div>
        </div>
      </div>
      <div className="w-full z-10 flex gap-2 flex-col text-center mt-16 text-black">
        <h1 className="text-3xl font-semibold">John Doe.</h1>
        <p className="text-md font-medium">john.doe@gmail.com</p>
      </div>

      <div className="w-full rounded-2xl bg-[#FEF8F5] p-4 pb-0 ">
        {[
          { name: "Name", value: "John Doe" },
          { name: "Email", value: "nm_kharchi@esi.dz" },
          { name: "Phone NUmber", value: "0793701384" },
          { name: "Address", value: "02 Rue Chiba ALi Birtouta Alger" },
          { name: "Date of birth", value: "12-01-2006" },
        ].map((el, index) => {
          return (
            <div
              key={index}
              className="w-full h-full flex flex-col justify-between items-center text-left"
            >
              <div className="w-full  px-4 py-4 h-full flex flex-row justify-between items-center text-left">
                <div className="w-full h-full flex flex-col justify-center gap-1 items-center">
                  <p className="w-full text-xs font-extralight">{el.name}</p>
                  <h1 className="w-full text-xl">{el.value}</h1>
                </div>
                <div className="w-full h-full flex justify-end gap-2 flex-row items-center">
                  {el.name === "Email" && (
                    <button className="w-fit py-2 px-3 flex flex-row justify-center items-center rounded-md border-[1px] gap-2">
                      {plus} Add another email
                    </button>
                  )}
                  <button className="w-fit py-2 px-3 flex flex-row justify-center items-center rounded-md border-[1px] gap-1">
                    {modify} Change
                  </button>
                </div>
              </div>
              {index !== 4 && (
                <hr className="h-1 w-[95%] border-[rgba(0,0,0,0.1)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
