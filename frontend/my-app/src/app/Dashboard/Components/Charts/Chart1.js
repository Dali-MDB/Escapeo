"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function Chart1() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Generating random data for different dates
    const generatedData = [
        { date: 1, region: "North", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "West", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "Central", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "North", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "South", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "East", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "West", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "Central", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "North", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "South", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "East", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "West", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "Central", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "North", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "South", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "East", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "West", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "Central", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "North", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "South", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "East", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "West", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "Central", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "North", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "South", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "East", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "West", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "Central", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "West", value: Math.floor(Math.random() * 100) },
        { date: 1, region: "Central", value: Math.floor(Math.random() * 100) },
      ].map((el , index)=>{{
        return {...el , date: index+1}
} })
      ;

    setData(generatedData);
  }, []);

  return (
    <div className=" px-4 flex flex-col gap-5 justify-center py-6 px-auto w-full rounded-2xl bg-[#FEF8F5]">
      <h1 className="w-fit px-8 text-lg">Visitors analytics</h1>
      
    </div>
  );
}
