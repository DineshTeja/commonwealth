import React from 'react';
import Link from 'next/link';
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button"
import Image from 'next/image';
import { features } from "@/lib/landingpagedata";
import { BentoCard } from "@/components/magicui/bento-grid";
import AnimatedGradientText from "@/components/magicui/animated-gradient-text";
import { cn } from "@/lib/utils";
import NumberTicker from "@/components/magicui/number-ticker";
import { MegaphoneIcon } from '@heroicons/react/24/solid';

export default function LandingPageComponent () {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center flex-1 transition-all duration-300 w-full overflow-x-hidden"> 
        <header className="w-full max-w-[80%] flex items-center justify-between p-6">
          <div className="flex items-center space-x-2">
            <Image src="/images/commonwealth.png" alt="Commonwealth.ai" width={50} height={50}/>
            <span className="text-xl text-purple-800 font-light">Commonwealth.ai</span>
          </div>
          <Link href="https://calendly.com/dineshvasireddy/lets-chat">
            <Button variant="default" className="hidden sm:block bg-purple-800 hover:bg-purple-700 text-white rounded-3xl mt-4">
              Book a demo
            </Button>
          </Link>
        </header>
        <main className="flex flex-col items-center flex-1 text-center w-full mt-20">
          <div className="space-y-4">
            <AnimatedGradientText className="items-center justify-center">
              🎉 <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
              <span
                className={cn(
                  `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                )}
              >
                Welcome to V2 of Commonwealth.ai
              </span>
            </AnimatedGradientText>
            <div className="p-3 text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-300 bg-clip-text text-transparent">Building a Standard for News</div>
            <p className="mt-3 text-lg text-purple-900 bg-white font-medium">Simple transormation. Strict Structures. Instant exports. <strong>A treasure trove of data at your fingertips.</strong></p>
            <Link href="https://calendly.com/dineshvasireddy/lets-chat">
              <Button variant="default" className="bg-purple-800 hover:bg-purple-700 text-white rounded-full mt-4">
                Book a demo
              </Button>
            </Link>
          </div>
          <section className="relative flex justify-center mt-20 transition-transform duration-500 px-4 w-full max-w-4xl">
            <Carousel defaultValue={1} className="relative w-full">
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
          <section className="mt-[200px] w-full px-4">
            <div className="flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-20">
              <div className="text-center">
                <p className="whitespace-pre-wrap text-7xl font-medium tracking-tighter text-purple-900 dark:text-white">
                  <NumberTicker value={2133} className="text-purple-900" />
                </p>
                <div className="mt-8 text-2xl font-medium bg-gradient-to-r from-purple-500 to-pink-300 bg-clip-text text-transparent">Users (40% Active)</div>
              </div>
              <div className="text-center">
                <p className="whitespace-pre-wrap text-7xl font-medium tracking-tighter text-purple-900 dark:text-white">
                  <NumberTicker value={12000} className="text-purple-900"/>+
                </p>
                <div className="mt-8 text-2xl font-medium bg-gradient-to-r from-purple-500 to-pink-300 bg-clip-text text-transparent">Articles Processed</div>
              </div>
              <div className="text-center">
                <p className="whitespace-pre-wrap text-7xl font-medium tracking-tighter text-purple-900 dark:text-white">
                  <NumberTicker value={15} className="text-purple-900"/>
                </p>
                <div className="mt-8 text-2xl font-medium bg-gradient-to-r from-purple-500 to-pink-300 bg-clip-text text-transparent">Active Political Campaigns</div>
              </div>
            </div>
          </section>
          <section id="projects" className="mt-20 scroll-mt-28 mb-20 overflow-x-hidden px-4 w-full">
            <div className="flex flex-col space-y-10">
              {features.map((feature, index) => {
                const { description, title, ...featureProps } = feature;
                return (
                  <div key={feature.name} className={`flex flex-col lg:flex-row ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''} items-center`}>
                    <div className="w-full lg:flex-1">
                      <BentoCard className="h-auto w-full" {...featureProps} description={""} />
                    </div>
                    <div className={`flex-1 p-6 ${index % 2 === 0 ? 'text-left items-start justify-start' : 'text-right items-end justify-end'}`}>
                        <div className={`${feature.title==="LLM-Powered Data Extraction" ? 'flex': ''} text-2xl font-medium bg-gradient-to-r from-purple-500 to-pink-300 bg-clip-text text-transparent items-center`}>
                            {feature.title}
                            {feature.title === "LLM-Powered Data Extraction" && (
                            <AnimatedGradientText className='items-start justify-start ml-2'>
                                <MegaphoneIcon className='h-4 w-4 my-auto text-purple-700'/> 
                                <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
                                <span
                                className={cn(
                                    `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                                )}
                                >
                                BETA
                                </span>
                            </AnimatedGradientText>
                            )}
                        </div>
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
    );
}