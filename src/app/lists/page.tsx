"use client";
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ListManager from '@/components/ui/ListManager';
import SinglePageLayout from '@/components/SinglePageLayout';

const ListsPage = () => {
  const { userId } = useAuth();
  return (
    <SinglePageLayout userId={userId ?? ''}>
        <div className="flex w-auto min-h-screen">
          <div className="flex-1 ml-auto transition-all duration-300"> 
            <main className="flex flex-col items-center justify-center flex-1 pt-12 pb-3 px-8 gap-8">
              <div className="w-[70%]">
                {userId && <ListManager userId={userId}/>}
              </div>
            </main>
          </div>
        </div>
    </SinglePageLayout>
  );
};

export default ListsPage;