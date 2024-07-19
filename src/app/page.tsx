"use client";
import React from 'react';
import SinglePageLayout from "@/components/SinglePageLayout";
import LandingPageComponent from '@/components/LandingPage';

export default function HomePage() {
  return (
    <SinglePageLayout home={true}>
      <LandingPageComponent/>
    </SinglePageLayout>
  );
}