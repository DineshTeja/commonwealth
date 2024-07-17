"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <div className="relative">
    <div className="before:content-[''] before:w-full before:h-0.5 before:bg-neutral-200 before:absolute before:bottom-0.5 before:left-0" />
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "flex relative items-center gap-5 overflow-x-auto overflow-y-hidden pb-1 z-0",
        className,
      )}
      {...props}
    />
  </div>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, onClick, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    onClick={onClick}
    className={cn(
      "after:content-[''] after:w-full after:h-0.5 after:z-50 after:bg-primary-light after:absolute after:-bottom-0.5 after:left-0 relative leading-4 text-sm xl:w-64 pb-[calc(1rem_-_2px)] after:bg-transparent text-black hover:after:bg-neutral-300 data-[state='active']:after:bg-primary-light data-[state='active']:text-primary-light data-[state='active']:text-white data-[state='active']:font-semibold font-medium bg-purple-100 data-[state='active']:bg-purple-900 data-[state='active']:shadow-inner p-2 rounded-t-lg flex-shrink-0 2xl:flex-initial group",
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-lightest focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
