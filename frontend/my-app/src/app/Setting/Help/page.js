"use client";

import { useState } from "react";
import { flightIcon, staysIcon } from "@/app/data/data";
import HistoryBox from "../components/HistoryBox";
import { flightsData, staysData } from "../data";
import Link from "next/link";
import HelpCentter from "@/app/Help_Center/page";

export default function History() {

  return (
    <div className="w-full py-0 px-2 flex flex-col gap-6">
      <div className="w-full flex flex-col justify-center items-center gap-6 ">
        {[
          { title: "Help Center", buttonTitle: "Find your topic" },
          { title: "Ask Melio", buttonTitle: "Show chatbot" },
          { title: "Write us a request", buttonTitle: "Contact Form" },
          { title: "Speak with our Support team", buttonTitle: "Direct Messaging" },
        ].map((el,index)=><div className="w-full bg-[#FEF8F5] py-6 rounded-xl px-6 flex flex-row justify-between items-center" key={index}>

        <h1 className="text-2xl font-bold">{el.title}</h1>
        <Link href={'../../Help_Center'} className="border-[1px] w-[18%] py-3 text-xl text-center font-medium border-black rounded-lg">{el.buttonTitle}</Link>
        </div>)}
      </div>
    </div>
  );
}
