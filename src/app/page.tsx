"use client";
import React from 'react';
import Link from 'next/link';
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image';
import { features } from "@/lib/landingpagedata";
import SinglePageLayout from "@/components/SinglePageLayout";
import { BentoCard } from "@/components/magicui/bento-grid";

export default function HomePage() {
  return (
    <SinglePageLayout>
      <div className="min-h-screen flex flex-col items-center justify-center flex-1 transition-all duration-300"> 
        <header className="w-full max-w-[80%] flex items-center justify-between p-6">
          <div className="flex items-center space-x-2">
            <Image src="/images/commonwealth.png" alt="Commonwealth.ai" width={50} height={50}/>
            <span className="text-xl text-purple-800 font-light">Commonwealth.ai</span>
          </div>
          <Link href="https://calendly.com/dineshvasireddy/lets-chat">
            <Button variant="default" className="bg-black text-white rounded-full">
              Book a demo
            </Button>
          </Link>
        </header>
        <main className="flex flex-col items-center flex-1 text-center w-full mt-20">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-black">
              <span className="font-medium">Backed by</span>
              <Badge variant="secondary" className="bg-[#0091ff] text-white">
                Various Angels
              </Badge>
            </div>
            <div className="p-3 text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-300 bg-clip-text text-transparent">Providing Structure to News</div>
            <p className="mt-3 text-lg text-purple-900 bg-white font-medium">Simple transormation. Instant exports. <strong>A treasure trove of data at your fingertips.</strong></p>
            <Link href="https://calendly.com/dineshvasireddy/lets-chat">
              <Button variant="default" className="bg-purple-800 text-white rounded-full mt-4">
                Book a demo
              </Button>
            </Link>
          </div>
          <section className="relative flex justify-center mt-20 transition-transform duration-500 px-10">
            <Carousel defaultValue={1} className="relative w-full max-w-4xl">
              <CarouselItem className="relative">
                <div className="absolute top-0 left-0 transform rotate-[-5deg] z-10">
                  <Image src="/images/dashboard1.png" alt="Dashboard preview 1" width={1000} height={500} className="rounded-lg shadow-lg"/>
                </div>
                <div className="absolute top-0 left-0 transform rotate-[0deg] z-20">
                  <Image src="/images/dashboard2.png" alt="Dashboard preview 2" width={1000} height={500} className="rounded-lg shadow-lg"/>
                </div>
                <div className="absolute top-0 left-0 transform rotate-[5deg] z-30">
                  <Image src="/images/dashboard3.png" alt="Dashboard preview 3" width={1000} height={500} className="rounded-lg shadow-lg"/>
                </div>
              </CarouselItem>
              <CarouselItem className="transform rotate-[0deg] z-20">
                <Image src="/images/dashboard2.png" alt="Dashboard preview 2" width={1000} height={500} className="rounded-lg shadow-lg"/>
              </CarouselItem>
            </Carousel>
          </section>
          <section id="projects" className="mt-80 scroll-mt-28 mb-20 overflow-x-hidden px-4">
            <div className="flex flex-col space-y-10">
              {features.map((feature, index) => {
                const { description, title, ...featureProps } = feature;
                return (
                  <div key={feature.name} className={`flex flex-col lg:flex-row ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''} items-center`}>
                    <div className="flex-1 p-6">
                      <BentoCard {...featureProps} description={""} />
                    </div>
                    <div className={`flex-1 p-6 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                      <div className="text-2xl font-medium bg-gradient-to-r from-purple-500 to-pink-300 bg-clip-text text-transparent">{feature.title}</div>
                      <p className="mt-2 text-lg">{feature.description}</p>
                      <Link href={feature.href}>
                        <Button size="sm" variant="default" className="bg-purple-800 hover:bg-purple-700 mt-4 rounded-2xl">
                          {feature.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </SinglePageLayout>
  );
}