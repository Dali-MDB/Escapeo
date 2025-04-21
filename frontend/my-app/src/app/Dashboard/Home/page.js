"use client";
import Team from "../Components/Team";
import { data } from "../data";
import MyGeoChart from "../Components/Charts/GeoChart";
import MyBarChart from "../Components/Charts/BarChar";
import MyPieChart from "../Components/Charts/PieChart";
import MyBarChart2 from "../Components/Charts/BarChart2";
import MyBarChart3 from "../Components/Charts/BarChart3";
export default function Home() {
  return (
    <div className=" w-full flex flex-col gap-6">
      <div className="w-full h-96 p-8 flex flex-col justify-center gap-3 rounded-xl bg-[var(--bg-color)] items-center">
        <h1 className="text-left py-2 w-full text-2xl font-semibold">
          Visitors Analytics
        </h1>
        <MyBarChart />
      </div>
      <div className=" flex flex-row  justify-center  px-auto w-full gap-1 rounded-xl ">
        {[
          { value: "18.6K", title: "Unique Visitors", percent: "10%" },
          { value: "55.9K", title: "Total Pageviews", percent: "10%" },
          { value: "54%", title: "Bounce Rate", percent: "10%" },
          { value: "2m 56s", title: "Visit Duration", percent: "10%" },
        ].map((el, index) => (
          <div
            key={index}
            className="w-full p-8 flex flex-col justify-center gap-3 rounded-xl bg-[var(--bg-color)] items-center"
          >
            <span className="w-full flex justify-between items-center">
              <h1 className="w-full text-2xl font-bold">{el.value}</h1>
              <p className="w-full text-lg text-right text-gray-700">
                {el.percent}
              </p>{" "}
            </span>
            <span className="w-full text-lg">{el.title}</span>
          </div>
        ))}
      </div>
      <div className="w-full grid grid-cols-[2fr_1fr] grid-rows-2 gap-4 p-0">
        {/* Left Section - Geo Chart */}
        <div className="col-span-1 row-span-2 py-10 px-8  w-full overflow-hidden flex flex-col justify-center gap-3 rounded-xl bg-[var(--bg-color)] items-center">
          <h1 className="text-left py-2 w-full text-2xl font-semibold">
            Top Countries
          </h1>
          <MyGeoChart />
          <MyBarChart2 />
        </div>

        {/* Right Section - Top Half */}
        <div className="col-span-1 p-8 row-span-1 rounded-xl w-full flex flex-col bg-[var(--bg-color)] justify-center items-center">
        <h1 className="text-left py-2 w-full text-2xl font-semibold">
            Top Content
          </h1>
          
          <MyBarChart3 />
        </div>

        {/* Right Section - Bottom Half */}
        <div className="col-span-1 row-span-1 p-8 rounded-xl w-full flex bg-[var(--bg-color)] justify-center items-center">
          <MyPieChart />
        </div>
      </div>
    </div>
  );
}
