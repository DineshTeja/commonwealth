"use client";
import React, { useEffect, useState } from "react";
import ArticlesComponent from "@/components/ui/articles";
import axios from "axios";
import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebaseConfig.ts"; // Ensure you have this config set up
import { collection, getDocs, addDoc, deleteDoc, getFirestore } from "firebase/firestore";
import { useCallback } from "react";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
const db = getFirestore(app);

function View() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [articlesJson, setArticlesJson] = useState([]);

  useEffect(() => {
    setIsFirebaseReady(true);
  }, []);

  async function fetchAllFromArticlesJson() {
    try {
      const articlesJsonCol = collection(db, "articlesJson");
      const snapshot = await getDocs(articlesJsonCol);
      const articlesJsonList = snapshot.docs.map((doc) => doc.data());
      console.log(articlesJsonList);

      console.log("made it to fetcharticlesfromjson");

      setArticles(articlesJsonList);
      console.log("set articles");
    } catch (error) {
      console.error("Error fetching articles from articlesJson:", error);
    }
  }

  async function manualProcessArticles() {
    const articlesCol = collection(db, "articles");
    const articleSnapshot = await getDocs(articlesCol);
    const articlesList = articleSnapshot.docs.map((doc) => doc.data().url);

    console.log("articles here");
    console.log(articlesList);

    const articlesResponse = await fetch("/get_articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls: articlesList }),
    });

    console.log(articlesResponse);

    if (!articlesResponse.ok) {
      throw new Error(`HTTP error! status: ${articlesResponse.status}`);
    }

    const contentType = articlesResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Received non-JSON response from server.");
    }

    const articlesData = await articlesResponse.json();

    const articlesJsonCol = collection(db, "articlesJson");
    for (const article of articlesData) {
      await addDoc(articlesJsonCol, article);
    }
  }

  const fetchArticlesFromFirestore = useCallback(async (manual: boolean) => {
    setIsLoading(true);
    const articlesCol = collection(db, "articles");
    const articleSnapshot = await getDocs(articlesCol);
    const articlesList = articleSnapshot.docs.map((doc) => doc.data().url);
    console.log(articlesList);

    const newArticlesCol = collection(db, "newArticles");
    const newArticleSnapshot = await getDocs(newArticlesCol);
    const newArticlesList = newArticleSnapshot.docs.map((doc) => doc.data().url);

    try {
      if (articlesList.length === 0) {
        setIsEmpty(true);
      } else {
        if (manual) {
          console.log("manualProcessArticles call");
          console.log("new articles here");
          console.log(newArticlesList);
      
          const articlesResponse = await fetch("/get_articles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ urls: newArticlesList }),
          });
      
          console.log(articlesResponse);
      
          if (!articlesResponse.ok) {
            throw new Error(`HTTP error! status: ${articlesResponse.status}`);
          }
      
          const contentType = articlesResponse.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server.");
          }
      
          const articlesData = await articlesResponse.json();
      
          const articlesJsonCol = collection(db, "articlesJson");
          for (const article of articlesData) {
            await addDoc(articlesJsonCol, article);
          }

          console.log("New articles collection cleared.");

          fetchAllFromArticlesJson();
        } else {
          fetchAllFromArticlesJson();
        }

        for (const doc of newArticleSnapshot.docs) {
          await deleteDoc(doc.ref);
        }
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to manually trigger the scrape and store process
  const triggerManualScrape = async () => {
    setIsLoading(true);
    setIsEmpty(false);

    console.log("trigger manual scrape");
    const manualScrapeAndStoreArticles = httpsCallable(
      functions,
      "manualScrapeAndStoreArticles"
    );

    console.log(
      "Callable function reference created:",
      manualScrapeAndStoreArticles.name
    );

    try {
      console.log("try trigger manual scrape");

      const fetchedurls = await manualScrapeAndStoreArticles({});
      console.log("Function call result:", fetchedurls);

      await fetchArticlesFromFirestore(true);
    } catch (error) {
      console.error("Error triggering manual scrape:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only attempt to fetch articles if Firebase has been initialized
    if (isFirebaseReady) {
      fetchArticlesFromFirestore(false);
    }
  }, [isFirebaseReady, fetchArticlesFromFirestore]);

  // useEffect(() => {
  //   const fetchUrlsAndArticles = async () => {
  //     setIsLoading(true); // Start loading

  //     const searchQuery = `political articles + news + trending`;
  //     try {
  //       // Fetch URLs from the Scrape-it.cloud API
  //       const response = await axios.get(
  //         `https://api.scrape-it.cloud/scrape/google?q=${encodeURIComponent(
  //           searchQuery
  //         )}&tbm=nws&start=5&num=500&when=6d`,
  //         {
  //           headers: {
  //             "x-api-key": process.env.NEXT_PUBLIC_SCRAPE_IT_API_KEY,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (response.data && response.data.newsResults) {
  //         const fetchedUrls = response.data.newsResults.map(
  //           (result) => result.link
  //         );

  //         console.log(fetchedUrls);

  //         // Send URLs to Flask backend to fetch articles' content
  //         const articlesResponse = await fetch("/get_articles", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ urls: fetchedUrls }),
  //         });

  //         const articlesData = await articlesResponse.json();
  //         setArticles(articlesData); // Store fetched articles in state
  //       } else {
  //         console.error("Unexpected API response structure:", response.data);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch URLs or articles:", error);
  //     } finally {
  //       setIsLoading(false); // End loading
  //     }
  //   };

  //   fetchUrlsAndArticles();
  // }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <main className="flex h-screen flex-col items-center justify-between py-12 px-16 gap-8 bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      <div className="w-full">
        <div className="flex flex-col items-center gap-1 p-12 w-full">
          <div className="font-extrabold text-3xl text-slate-800">
            Commonwealth.ai
          </div>
          <div className="text-slate-500 font-medium">
            an obviously simple political digest.
          </div>
          {/* Add a button to manually trigger the scrape */}
          <button
            onClick={triggerManualScrape}
            className="mt-4 py-1 px-3 bg-purple-400 text-white rounded-3xl hover:bg-purple-500"
          >
            Refresh Database
          </button>
        </div>
        <ArticlesComponent
          articles={articles}
          articlesJson={articlesJson}
          isLoading={isLoading}
          isEmpty={isEmpty}
        />
      </div>
    </main>
  );
}

export default function Home() {
  return <View />;
}
