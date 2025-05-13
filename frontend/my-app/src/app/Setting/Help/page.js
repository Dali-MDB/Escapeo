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
          { title: "Help Center", buttonTitle: "Find your topic", Link: "../../Help_Center" },
          { title: "Ask Melio", buttonTitle: "Show chatbot", Link: "#" },
          { title: "Write us a request", buttonTitle: "Contact Form", Link: "../../ContactForm" },
          { title: "Speak with our Support team", buttonTitle: "Direct Messaging", Link: "./Chat" },
        ].map((el,index)=><div className="w-full bg-[var(--bg-color)] py-6 rounded-xl px-6 flex flex-row justify-between items-center" key={index}>

        <h1 className="text-2xl font-bold">{el.title}</h1>
        <Link href={el.Link} className="border-[1px] w-[18%] py-3 text-xl text-center font-medium border-black rounded-lg">{el.buttonTitle}</Link>
        </div>)}
      </div>
    </div>
  );
}
