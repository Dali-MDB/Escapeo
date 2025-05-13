import Navbar from '../components/NavBar';
import Sidebar from './components/Sidebar';
import { TripProvider } from './context/tripContext';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#EEDAC4] text-black">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex justify-center items-start mt-[100px] pb-6 flex-1">
        <div className="w-[88%] flex flex-col">
          {/* Page Title */}
          <h1 className="text-left text-4xl font-bold">Settings</h1>

          {/* Layout: Sidebar + Main content */}
          <div className="flex flex-col md:flex-row gap-10 mt-5">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className="w-full box-border">
              <TripProvider>{children}</TripProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
