import { keyframes } from "styled-components";
import PackageCard from "./PackageCard";
import {packs} from "../data/data";


export default function Packages() {

    
    return (
      <section className=" h-screen flex justify-center  items-center w-full mx-auto">
        <div className="w-[75%] mx-auto">
          <div className="text-black flex w-full justify-between items-center">
            <div>
              <h2 className="text-5xl font-bold py-4">Packages</h2>
              <p className="text-xl">
              explore Our Best Travel Packages</p>
            </div>
            <button className="text-xl border-2 border-[rgba(0,0,0,0.2)] rounded-lg py-3 px-3">
              See All
            </button>
          </div>
  
          {/* Scrolling Container */}
          <div className="relative w-full text-white overflow-x-auto no-scrollbar py-6 mt-9">
            <div className="flex space-x-10 w-[calc(4.5*300px)] snap-x scroll-smooth">
              {packs.map((pack, index) => ( <PackageCard key={index} backgroundImage={pack.bgImg} link={pack.link} title={pack.title} description={pack.description} oldPrice={pack.prevPrice} newPrice={pack.newPrice} />
                ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  