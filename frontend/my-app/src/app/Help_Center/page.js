"use client";
import { use, useState } from "react";
import NavBar from "../components/NavBar";
import { bgColor,helpCenter, dotItcon, arrowIconUp,hide, arrowIconDown}  from "../data/data";



const Topic = (props) => {
  const [topicOpened, setTopicOpened] = useState(false);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full flex flex-row justify-between items-center">
        <span className="flex flex-row text-xl font-semibold justify-center items-center gap-2">
          {dotItcon} {props.topicTitle}
        </span>
        <span
          onClick={() => {
            setTopicOpened(!topicOpened);
          }}
        >
          {topicOpened ? arrowIconUp  :  arrowIconDown }
        </span>
      </div>
      <div className="w-full p-5 text-xl">
      { topicOpened &&  <p className="w-full m-5">{props.topicAnswer}</p>}
      </div>
    </div>
  );
};

const LilTopicDiv = (props) => {
  return (
    <div className="w-[98%] bg-[#EFE8E5] txet-black flex flex-col justify-center items-center gap-4 p-16 rounded-b-xl">
      {props.topics.map((el, index) => (
        <div className="w-full p-5 " key={index}>
        <Topic  {...el} />
        {index !== 4 && (
                <hr className="h-1 w-full mt-4 border-[rgba(0,0,0,0.1)]" />
              )}
</div>
      ))}
    </div>
  );
};

const BigTopicDiv = (props) => {
  const [opened, setOpened] = useState(false);
  return opened || !props.oneIsOpen ? (
    <div className="w-full flex flex-col justify-center items-center ">
      <div className="w-full bg-[#FEF8F5] rounded-xl p-6 flex flex-row justify-between items-center">
        <h1 className="text-xl font-bold">{props.topic}</h1>
        
          <button
            className={` w-[12%] px-4 py-3 text-xl text-center flex justify-center items-center font-medium  rounded-lg ${opened ? "" : "border-[1px] border-black"}`}
            onClick={() => {
              setOpened(!opened);
              props.setOneIsOpen((prev)=>!prev);
            }}
          >
            { opened ? hide : "Find your topic"}
          </button>
        
      </div>
      {opened && <LilTopicDiv topics={props.topics} />}
    </div>
  ) : (
    <div className="h-0 w-0"></div>
  );
};

export default function HelpCentter() {
  const [onIsOpen, setOneIsOpen] = useState(false);
  return (
    <div className={`w-full  min-h-screen bg-[${bgColor}]`}>
      <NavBar />
      <div className="w-full p-40 mx-auto flex  flex-col justify-center items-center gap-6 ">
        <h1 className="w-full text-[45px] font-extrabold">Help Center</h1>
        {helpCenter.map((el, index) => (
          <BigTopicDiv
            key={index}
            oneIsOpen={onIsOpen}
            setOneIsOpen={setOneIsOpen}
            {...el}
          />
        ))}{" "}
      </div>
    </div>
  );
}
