"use client"
import Hero from "./components/HeroConnected";
import Hero2 from "./components/HeroNonConnected";
import PopularDest from "./components/PopularDestination";
import SpecialOffers from "./components/SpecialOffers";
import Packages from "./components/Packages";
import Foryou from "./components/ForYou";
import Reviews from "./components/reviewsHome";
import { useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Template from './template';

export default function Home() {
{/**
  // app/page.js (or any other page)

export default function Home() {
  return (
    <Template>
      </Template>
    );
  } */}
  
  const { isAuthenticated, setIsAuthenticated } = useAuth();


  return (
    <div className="bg-[#EEDAC4] px-0 pt-10 m-0 w-full">
      <NavBar />
      { isAuthenticated ? <Hero /> : <Hero2 /> }
      <PopularDest />
      <SpecialOffers />
      <Packages />
      {isAuthenticated && <Foryou />}
      <Reviews />
    </div>
  );
}
