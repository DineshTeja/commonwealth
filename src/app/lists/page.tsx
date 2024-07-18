"use client";
import React from 'react';
import Navbar from '@/components/ui/Navbar';
import RouteGuard from '@/components/RouteGuard';
import { useAuth } from '@/hooks/useAuth';
import ListManager from '@/components/ui/ListManager';

const ListsPage = () => {
  const { userId } = useAuth();
  return (
    <RouteGuard userId={userId ?? ''}>
      <div className="flex w-auto">
        <Navbar />
        <main className="flex flex-col items-center justify-center flex-1 pt-12 pb-3 px-8 gap-8">
          <div className="w-[70%]">
            {userId && <ListManager userId={userId}/>}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
};

export default ListsPage;