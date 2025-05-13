import Footer from "../components/Footer";

export default function  SearchLayout({ children }) {
  return (
      <div className="min-h-screen min-w-screen text-black bg-[var(--bg-color)] flex flex-col justify-center items-center ">
          {children} {/* This will now have access to the FormContext */}
          <Footer />
      </div>
    
  );
}