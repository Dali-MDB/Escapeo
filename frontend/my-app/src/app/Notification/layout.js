// components/Layout.js
import Navbar from '../components/NavBar'; 
export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', backgroundColor:'#EEDAC4',color:'black',flexDirection: 'column' ,padding:'0' , minHeight:'100vh'}}>
      {/* Navbar at the top */}
      <Navbar />

      {/* Centered content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'start' , marginTop:'100px' , paddingBottom:'25px' }}>
        <div style={{ width: '88%', display: 'flex', flexDirection: 'column' }}>
          {/* Title */}
          <h1 style={{ width:'80%' ,textAlign: 'left' ,fontSize:'45px' ,fontWeight:'bolder', marginRight:'auto' , marginLeft:'auto'  }}>Notifications</h1>

          {/* Flex row for sidebar and content */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', marginTop: '30px' }}>
            {/* Sidebar */}
         
            {/* Main content */}
            <div style={{ width:'80%' ,boxSizing:'border-box' , marginRight:'auto' , marginLeft:'auto' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}