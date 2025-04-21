'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar.js';
import Sidebar from './Components/SideBar';
import { TripProvider } from './context/tripContext';

export default function Layout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {

        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://127.0.0.1:8000/my_profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = await res.json();
        // Replace this condition with your actual admin check
        if (!user.years_of_experience) {

           router.push('/');
           
           return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Admin check failed:', error);
        router.push('/');
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) return null; // Or a loading spinner

  return (
    <TripProvider>
      <div style={{ display: 'flex', backgroundColor:'#EEDAC4', color:'black', flexDirection: 'column', padding:'0', minHeight:'100vh' }}>
        <NavBar />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'start', marginTop:'100px', paddingBottom:'25px' }}>
          <div style={{ width: '88%', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ textAlign: 'left', fontSize:'45px', fontWeight:'bolder' }}>Settings</h1>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', marginTop: '20px' }}>
              <Sidebar />

              <div style={{ width:'100%', boxSizing:'border-box' }}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TripProvider>
  );
}
