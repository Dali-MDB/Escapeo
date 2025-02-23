import Hero from "./components/Hero";
import PopularDest from "./components/PopularDestination";
import SpecialOffers from "./components/SpecialOffers";
import Packages from "./components/Packages";
import Foryou from "./components/ForYou";
import Reviews from "./components/reviewsHome";
export default function Home() {


  return (
    <div className="bg-[#CDD5D8] p-0 pt-10 m-0 w-full">
      <Hero />
      <PopularDest />
      <SpecialOffers />
      <Packages />
      <Foryou />
      <Reviews />
    </div>
  );
}
