"use client";
import React from 'react';
import Navbar from '@/components/ui/Navbar';
import { useAuth } from '@/hooks/useAuth';
import RouteGuard from '@/components/RouteGuard';

export default function SettingsPage() {
  const { userId } = useAuth();
  return (
    <RouteGuard userId={userId ?? ''}>
      <div className="flex">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center gap-1 px-12 pt-12 pb-1 w-full">
            <div
              className="font-medium text-3xl text-slate-800"
              style={{
                background: "linear-gradient(to right, #6a1b9a, #da77f2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Commonwealth.ai
            </div>
            <div className="text-slate-500 font-normal">
              <strong>instantly</strong> transform political media into <strong>structured data</strong>. 
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}