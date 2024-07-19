"use client";
import React from 'react';
import RouteGuard from '@/components/RouteGuard';
import { useAuth } from '@/hooks/useAuth';
import ListManager from '@/components/ui/ListManager';
import SinglePageLayout from '@/components/SinglePageLayout';

const ListsPage = () => {
  const { userId } = useAuth();
  return (
    <SinglePageLayout>
      <RouteGuard userId={userId ?? ''}>
        <div className="flex w-auto">
          <div className="flex-1 ml-auto transition-all duration-300"> 
            <main className="flex flex-col items-center justify-center flex-1 pt-12 pb-3 px-8 gap-8">
              <div className="w-[70%]">
                {userId && <ListManager userId={userId}/>}
              </div>
            </main>
          </div>
        </div>
      </RouteGuard>
    </SinglePageLayout>
  );
};

export default ListsPage;