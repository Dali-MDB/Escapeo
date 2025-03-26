"use client"
import { Chart } from "chart.js";
import Chart1 from "../Components/Charts/Chart1";
import Geo from "../Components/Charts/Geo";

import { StaticMap } from "react-map-gl";

export default function Home() {
  return (
    <div className=" flex flex-col gap-6">
      <Chart1 />
      <div className=" flex flex-row  justify-center  px-auto w-full gap-1 rounded-xl ">
        {[
          { value: "18.6K", title: "Unique Visitors" , percent:'10%' },
          { value: "55.9K", title: "Total Pageviews" , percent:'10%' },
          { value: "54%",   title: "Bounce Rate" , percent:'10%' },
          { value: "2m 56s",title: "Visit Duration" , percent:'10%' },
        ].map((el , index)=>(<div key={index} className="w-full p-8 flex flex-col justify-center gap-3 rounded-xl bg-[#FEF8F5] items-center">
                <span className="w-full flex justify-between items-center"><h1 className="w-full text-2xl font-bold">{el.value}</h1><p className="w-full text-lg text-right text-gray-700">{el.percent}</p> </span>
                <span className="w-full text-lg">{el.title}</span>
        </div>))}
      </div>
      <div id="chartDiv" style="max-width: 740px;height: 400px;margin: 0px auto">
    </div>
    </div>
  );
}
