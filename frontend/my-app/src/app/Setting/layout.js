// components/Layout.js
import Navbar from '../components/NavBar'; // Assuming you have a Navbar component
import Sidebar from './components/Sidebar';
import { TripProvider } from './context/tripContext';
export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', backgroundColor:'#EEDAC4',color:'black',flexDirection: 'column' ,padding:'0' , minHeight:'100vh'}}>
      {/* Navbar at the top */}
      <Navbar />

      {/* Centered content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'start' , marginTop:'100px' , paddingBottom:'25px' }}>
        <div style={{ width: '88%', display: 'flex', flexDirection: 'column' }}>
          {/* Title */}
          <h1 style={{ textAlign: 'left' ,fontSize:'45px' ,fontWeight:'bolder' }}>Settings</h1>

          {/* Flex row for sidebar and content */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', marginTop: '20px' }}>
            {/* Sidebar */}
          <Sidebar />

            {/* Main content */}
            <div style={{ width:'100%' ,boxSizing:'border-box' }}>
              <TripProvider>
              {children}</TripProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}