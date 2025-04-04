// app/template.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Loading from './components/Loading';

export default function Template({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {isLoading && <Loading />}
      {children}
    </>
  );
}