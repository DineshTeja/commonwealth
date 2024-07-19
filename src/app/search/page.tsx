"use client";
import React from 'react';
import SinglePageLayout from '@/components/SinglePageLayout';
import { useAuth } from '@/hooks/useAuth';
import ArticlesComponent from '@/components/articles';

const ListsPage = () => {
  const { userId } = useAuth();
  return (
    <SinglePageLayout userId={userId ?? ''}>
        <div className="flex w-auto min-h-screen">
        <div className="flex-1 ml-auto transition-all duration-300"> 
          <main className="flex flex-col items-center justify-center flex-1 pt-12 pb-3 px-8 gap-8">
            <div className="max-w-[80%]">
              {userId && <ArticlesComponent userId={userId}/>}
            </div>
          </main>
        </div>
        </div>
    </SinglePageLayout>
  );
};

export default ListsPage;