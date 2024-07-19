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
      className: "absolute -right-20 -top-20 opacity-60",
    }),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    tags: ["React", "Next.js", "Langchain", "Google Cloud", "Firebase", "LLMs"],
  },
  {
    Icon: LayoutIcon,
    title: "Quick Structured Lists",
    name: "",
    description:
      "Quickly extract structured data from thousands of curated news articles. Built with OpenAI, Postgres, and Elasticsearch.",
    href: "https://commonwealthai.netlify.app/lists",
    cta: "Reach out to learn more!",
    background: React.createElement(Image, {
      src: "/images/dashboard2.png",
      alt: "Background",
      layout: "fill",
      objectFit: "cover",
      className: "absolute -right-20 -top-20 opacity-60",
    }),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    tags: ["Flask", "Google Cloud", "Fast.ai", "LLMs", "BERT"],
  },
  {
    Icon: MagicWandIcon,
    title: "LLM-Powered Data Extraction",
    name: "",
    description:
      "Easily extract structured data from thousands of curated news articles. Built with OpenAI, Postgres, and Elasticsearch.",
    href: "https://commonwealthai.netlify.app/extraction",
    cta: "Reach out to learn more!",
    background: React.createElement(Image, {
      src: "/images/dashboard3.png",
      alt: "Background",
      layout: "fill",
      objectFit: "cover",
      className: "absolute -right-20 -top-20 opacity-60",
    }),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    tags: ["Flask", "Langchain", "Fast.ai", "BERT", "LLMs"],
  },
] as const;