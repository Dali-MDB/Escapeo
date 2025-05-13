"use client";
import { useRef, useEffect } from "react";
import { FormProvider } from "@/app/context/FormContext"; // Import FormProvider

export default function LoginLayout({ children }) {
  const scrollRef = useRef(null);
  const images = ["/coverLogin1.png", "/coverLogin2.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: container.clientWidth, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <FormProvider> {/* Wrap the layout with FormProvider */}
      <div className="h-screen w-screen text-black bg-[#EEDAC4] flex justify-center items-center gap-10">
        <div className="w-3/6 h-[80%] flex flex-col gap-10 justify-center items-center">
          {children} {/* This will now have access to the FormContext */}
        </div>
        <div className="w-1/2 h-[80%] flex justify-center items-center">
          <div
            ref={scrollRef}
            className="w-3/4 h-full flex no-scrollbar overflow-x-scroll scroll-smooth snap-x snap-mandatory rounded-3xl"
            style={{ scrollBehavior: "smooth" }}
          >
            {images.map((img, index) => (
              <div
                key={index}
                className="w-full h-full flex-shrink-0 bg-cover bg-center snap-start"
                style={{
                  backgroundImage: `url(${img})`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}