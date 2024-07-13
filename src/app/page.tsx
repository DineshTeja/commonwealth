import Image from "next/image";
import supabase from "../supabaseClient";
import { useEffect } from "react";
import ArticlesComponent from "@/components/articles";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-12 pb-3 px-16 gap-8 bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      <div className="w-full">
        <div className="flex flex-col items-center gap-1 px-12 pt-12 pb-1 w-full">
          <div
            className="font-extrabold text-3xl text-slate-800"
            style={{
              background: "linear-gradient(to right, #6a1b9a, #da77f2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Commonwealth.ai
          </div>
          <div className="text-slate-500 font-normal">
            an obviously simple political digest.
          </div>
        </div>

        <ArticlesComponent />
      </div>
    </main>
  );
}
