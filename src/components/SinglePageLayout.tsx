import React, { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from "@/components/ui/Footer";

interface BaseLayoutProps {
  children: React.ReactNode;
}

const SinglePageLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Navbar 
        isCollapsed={isNavbarCollapsed} 
        setIsCollapsed={setIsNavbarCollapsed}
      />
      <main className={`flex-1 transition-all duration-300 ml-auto min-h-screen`}>
        {children}
        <div className="flex justify-center items-center">
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default SinglePageLayout;