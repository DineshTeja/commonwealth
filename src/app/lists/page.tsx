"use client";
import React from 'react';
import ListManager from '@/components/ui/ListManager';
import Navbar from '@/components/ui/Navbar';
import RouteGuard from '@/components/RouteGuard';
import { useAuth } from '@/hooks/useAuth';

const ListsPage = () => {
  const { userId } = useAuth();
  return (
    <RouteGuard userId={userId}>
      <div className="flex flex-col items-center justify-center">
        <Navbar />
        <main className="relative z-10 flex flex-col items-center justify-center w-full pt-12 pb-3 px-8 gap-8">
          <div className="w-full">
            <div className="flex flex-col items-center gap-1 px-12 pt-12 pb-1 w-full">
              <div
                className="font-medium text-3xl text-slate-800"
                style={{
                  background: "linear-gradient(to right, #6a1b9a, #da77f2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Manage Your Lists
              </div>
            </div>
            <ListManager userId={userId}/>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
};

export default ListsPage;