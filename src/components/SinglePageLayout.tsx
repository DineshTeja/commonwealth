import React, { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from "@/components/ui/Footer";
import RouteGuard from '@/components/RouteGuard';

interface BaseLayoutProps {
  userId?: string;
  children: React.ReactNode;
  home?: boolean;
}

const SinglePageLayout: React.FC<BaseLayoutProps> = ({ userId, children, home=false }) => {
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);

  return (
      <div className="flex min-h-screen">
        <Navbar 
          isCollapsed={isNavbarCollapsed} 
          setIsCollapsed={setIsNavbarCollapsed}
        />
        <main className={`flex-1 transition-all duration-300 ml-auto min-h-screen`}>
          {!home ?
            (<RouteGuard userId={userId ?? ''}>
              {children}
            </RouteGuard>) : (
            <>{children}</>
            )
          }
          {home && (
            <div className="flex justify-center items-center">
              <Footer />
            </div>
          )}
        </main>
      </div>
  );
};

export default SinglePageLayout;