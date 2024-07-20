import React from "react";
import {
  MagnifyingGlassIcon,
  LayoutIcon,
  MagicWandIcon,
} from "@radix-ui/react-icons";

import Image from "next/image";

export const features = [
  {
    Icon: MagnifyingGlassIcon,
    title: "Semantic Search",
    name: "",
    description:
      "Indexes and performs sentiment analysis on thousands of mainstream political articles daily, allows you to chat with articles via LLMs and RAG (contextualized using political publications and Twitter trends), and maintain day-to-day research threads.",
    href: "https://commonwealthai.netlify.app/search",
    cta: "Reach out to learn more!",
    background: React.createElement(Image, {
      src: "/images/dashboard1.png",
      alt: "Background",
      layout: "fill",
      objectFit: "cover",
      // className: "absolute -right-20 -top-20 opacity-60",
      // className: "absolute right-0 top-0 opacity-60 w-full h-full lg:-right-20 lg:-top-20",
    }),
    // className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3  w-full h-full",
    tags: ["React", "Next.js", "Langchain", "Google Cloud", "Firebase", "LLMs"],
  },
  {
    Icon: LayoutIcon,
    title: "Quick Structured Lists",
    name: "",
    description:
      "Quickly build specific bulk lists of trending news articles to export and extract information from. You can also just ask Commonwealth AI and we can create them for you in an instant!",
    href: "https://commonwealthai.netlify.app/lists",
    cta: "Reach out to learn more!",
    background: React.createElement(Image, {
      src: "/images/dashboard2.png",
      alt: "Background",
      layout: "fill",
      objectFit: "cover",
      // className: "absolute -right-20 -top-20 opacity-60",
    }),
    // className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    tags: ["Flask", "Google Cloud", "Fast.ai", "LLMs", "BERT"],
  },
  {
    Icon: MagicWandIcon,
    title: "LLM-Powered Data Extraction",
    name: "",
    description:
      "With just a natural language prompt, easily extract structured data from thousands of curated news articles in bulk, which can be exported in both JSON and tabular formats.",
    href: "https://commonwealthai.netlify.app/extraction",
    cta: "Reach out to learn more!",
    background: React.createElement(Image, {
      src: "/images/dashboard3.png",
      alt: "Background",
      layout: "fill",
      objectFit: "cover",
      // className: "absolute -right-20 -top-20 opacity-60",
    }),
    // className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    tags: ["Flask", "Langchain", "Fast.ai", "BERT", "LLMs"],
  },
] as const;