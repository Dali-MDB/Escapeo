"use client";
import Team from "../Components/Team";
import { data } from "../data";
import MyGeoChart from "../Components/Charts/GeoChart";
import MyBarChart from "../Components/Charts/BarChar";
import MyPieChart from "../Components/Charts/PieChart";
import MyBarChart2 from "../Components/Charts/BarChart2";
import MyBarChart3 from "../Components/Charts/BarChart3";
import { useEffect, useState } from "react";
import { API_URL } from "@/app/utils/constants";
export default function Home() {
  const [visitMonth, setVisitMonth] = useState(null)
  const [visitDay, setVisitDay] = useState(null)
  const [visitYear, setVisitYear] = useState(null)
  const [topDest, setTopDest] = useState(null)
  const [top5Dest, setTop5Dest] = useState(null)
  const [mostVisitPaths, setMostVisitPaths] = useState(null)
  const [stats, setStats] = useState({ top_countries: Array(0), visitors_today: 0, visitors_this_month: 0, bounce_rate: '0%', avg_duration_seconds: 0 })
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/panel/stats/visitors/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setStats(data); // <<< ici
        } else {
          console.log("Error fetching stats");
        }
      } catch (error) {
        alert(error);
      }
    };
    const fetchVisitorsMonthly = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/panel/visitors/monthly/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setVisitMonth(data); // <<< ici
        } else {
          console.log("Error fetching stats");
        }
      } catch (error) {
        alert(error);
      }
    };
    const fetchVisitorsDaily = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/panel/visitors/daily/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setVisitDay(data); // <<< ici
        } else {
          console.log("Error fetching stats");
        }
      } catch (error) {
        alert(error);
      }
    };
    const fetchVisitorsYearly = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/panel/visitors/yearlyy/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setVisitYear(data); // <<< ici
        } else {
          console.log("Error fetching stats");
        }
      } catch (error) {
        alert(error);
      }
    };
    const fetchDest = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/panel/top_destinations/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setTopDest(data); // <<< ici
        } else {
          console.log("Error fetching stats");
        }
      } catch (error) {
        alert(error);
      }
    };
    const fetch5Dest = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/panel/top_5_destinations/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setTop5Dest(data); // <<< ici
        } else {
          console.log("Error fetching stats");
        }
      } catch (error) {
        alert(error);
      }
    };
    const fetchVisitedPaths = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/panel/most_visited_paths/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setMostVisitPaths(data); // <<< ici
        } else {
          console.log("Error fetching stats");
        }
      } catch (error) {
        alert(error);
      }
    };

    fetchStatistics()
    fetchVisitorsMonthly()
    fetchVisitorsDaily()
    fetchVisitorsYearly()
    fetchDest()
    fetch5Dest()
    fetchVisitedPaths()
  }, []);


  return (
    <div className=" w-full flex flex-col gap-6">
      <div className="w-full h-96 p-8 flex flex-col justify-center gap-3 rounded-xl bg-[var(--bg-color)] items-center">
        <h1 className="text-left py-2 w-full text-2xl font-semibold">
          Visitors Analytics
        </h1>
        <MyBarChart />
      </div>
      {/**
       * top_countries: Array(0), visitors_today: 0, visitors_this_month: 0, bounce_rate: '0%', avg_duration_seconds: 0
       */}
      <div className=" flex flex-row  justify-center  px-auto w-full gap-1 rounded-xl ">

        {[
          { value: stats.visitors_today, title: "Unique Visitors", percent: "0%" },
          { value: stats.visitors_this_month, title: "Total Pageviews", percent: "0%" },
          { value: stats.bounce_rate, title: "Bounce Rate", percent: "0%" },
          { value: stats.avg_duration_seconds, title: "Visit Duration", percent: "0%" },
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
