/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable comma-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable arrow-parens */
/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// deploy with: firebase deploy --only functions

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

interface NewsResult {
  link: string;
}

// interface ArticleData {
//   title: string;
//   text: string;
//   content: string;
//   url: string;
//   publish_date: string;
//   source: string;
//   tags: string[];
// }

interface ArticleData {
  url: string;
}

// const db = admin.firestore();
// const articlesCollection = db.collection("articles");

// Function to perform the scraping and storing of articles
async function scrapeAndStoreArticles() {
  const searchQuery = "political articles + news + trending";
  const apiUrl =
    `https://api.scrape-it.cloud/scrape/google?q=${encodeURIComponent(
      searchQuery
    )}` + "&tbm=nws&start=5&num=500&when=6d";

  try {
    const scrapeResponse = await axios.get(apiUrl, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_SCRAPE_IT_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (scrapeResponse.data && scrapeResponse.data.newsResults) {
      const fetchedUrls = scrapeResponse.data.newsResults.map(
        (result: NewsResult) => result.link
      );

      //   const articlesResponse = await fetch("/get_articles", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({urls: fetchedUrls}),
      //   });

      const articlesResponse = await axios.post(
        "/get_articles",
        {urls: fetchedUrls},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Use the .json() method to parse the response body as JSON
      const articlesData: ArticleData[] = articlesResponse.data;
      const db = admin.firestore();
      const articlesCollection = db.collection("articles");

      articlesData.forEach(async (article: ArticleData) => {
        await articlesCollection.add(article);
      });

      console.log("Articles have been updated.");
    } else {
      console.error("Unexpected API response structure:", scrapeResponse.data);
    }
  } catch (error) {
    console.error("Failed to fetch URLs or articles:", error);
  }
}

// Scheduled function to automatically scrape and store articles every 24 hours
exports.scrapeAndStoreArticles = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (_context) => {
    await scrapeAndStoreArticles();
  });

// Callable function for manual triggering
// exports.manualScrapeAndStoreArticles = functions.https.onCall(async (data, context) => {
//   const vals = await scrapeAndStoreArticles();
//   return {result: "Manual scrape and store operation completed.", valsvalue: vals};
// });

// exports.manualScrapeAndStoreArticles = functions.https.onCall(async (data, context) => {
//     const searchQuery = "political articles + news + trending";
//     const apiUrl = `https://api.scrape-it.cloud/scrape/google?q=${encodeURIComponent(searchQuery)}` +
//       "&tbm=nws&start=5&num=500&when=6d";

//     const scrapeResponse = await axios.get(apiUrl, {
//         headers: {
//             "x-api-key": "c457e41c-d977-439c-bf8a-e87956f45650",
//             "Content-Type": "application/json",
//         },
//     });

//     if (scrapeResponse.data && scrapeResponse.data.newsResults) {
//         const fetchedUrls = scrapeResponse.data.newsResults.map((result: NewsResult) => result.link);
//         return {result: fetchedUrls};

//         // const articlesResponse = await fetch("/get_articles", {
//         // method: "POST",
//         // headers: {
//         //     "Content-Type": "application/json",
//         // },
//         // body: JSON.stringify({urls: fetchedUrls}),
//         // });

//         // const articlesData: ArticleData[] = await articlesResponse.json();

//         // articlesData.forEach(async (article: ArticleData) => {
//         //   await articlesCollection.add(article);
//         // });

//         // console.log("Articles have been updated.");
//     } else {
//         console.error("Unexpected API response structure:", scrapeResponse.data);
//     }

//     return {result: scrapeResponse.data};
// });

exports.manualScrapeAndStoreArticles = functions.https.onCall(
  async (data, context) => {
    const searchQuery = "political articles + news + trending";
    const apiUrl =
      `https://api.scrape-it.cloud/scrape/google?q=${encodeURIComponent(
        searchQuery
      )}` + "&tbm=nws&start=5&num=500&when=6d";

    try {
      const scrapeResponse = await axios.get(apiUrl, {
        headers: {
          "x-api-key": "c457e41c-d977-439c-bf8a-e87956f45650",
          "Content-Type": "application/json",
        },
      });

      if (scrapeResponse.data && scrapeResponse.data.newsResults) {
        const fetchedUrls = scrapeResponse.data.newsResults.map(
          (result: NewsResult) => result.link
        );

        // Prepare the data to be added to Firestore
        const articlesData = fetchedUrls.map((url: string) => ({url}));

        // Add each URL to the Firestore collection
        // const articlesCollection = admin.firestore().collection("articles");
        // const writePromisesArticles = articlesData.map((articleData: ArticleData) =>
        //   articlesCollection.add(articleData)
        // );
        // await Promise.all(writePromisesArticles);

        const articlesCollection = admin.firestore().collection("articles");
        const newArticlesCollection = admin.firestore().collection("newArticles");
        
        const checkAndAddUniqueArticle = async (articleData: ArticleData) => {
          // Check if the article is unique in the articlesCollection
          const existingArticleSnapshot = await articlesCollection.where("url", "==", articleData.url).limit(1).get();
          if (existingArticleSnapshot.empty) {
            // If unique, add to articlesCollection
            await articlesCollection.add(articleData);
            // Since it's unique in articlesCollection, it's also considered unique for newArticlesCollection
            return newArticlesCollection.add(articleData);
          } else {
            console.log(`Article with URL ${articleData.url} already exists in articlesCollection.`);
            // The article already exists in articlesCollection, so we don't add it to newArticlesCollection
            return null; // Explicitly return null if the article already exists in articlesCollection
          }
        };
        
        const writePromises = articlesData.map((articleData: ArticleData) => checkAndAddUniqueArticle(articleData));
        await Promise.all(writePromises);

        // const newArticlesCollection = admin.firestore().collection("newArticles");
        // const writePromisesNewArticles = articlesData.map((articleData: ArticleData) =>
        //   newArticlesCollection.add(articleData)
        // );
        // await Promise.all(writePromisesNewArticles);

        // const getArticlesUrl =
        //   "https://us-central1-commonwealth-ai.cloudfunctions.net/get_articles";
        // // const openAIurl = "https://us-central1-commonwealth-ai.cloudfunctions.net/call_openai";

        // try {
        //   //   const articlesResponse = await axios.post(getArticlesUrl, {
        //   //        urls: fetchedUrls
        //   //     }, {
        //   //        headers: {
        //   //           "Content-Type": "application/json",
        //   //        },
        //   //   });

        //   const articlesResponse = await fetch(getArticlesUrl, {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ urls: fetchedUrls }),
        //   });

        //   if (!articlesResponse.ok) {
        //     throw new Error(`HTTP error! status: ${articlesResponse.status}`);
        //   }

        //   const articlesResponseData = await articlesResponse.json();

        //   const articlesPyResponseCollection = admin
        //     .firestore()
        //     .collection("articlesPyResponse");

        //   //   // Iterate over each article and add it to the Firestore collection
        //   //   await Promise.all(articlesResponseData.map(async (article: any) => {
        //   //     try {
        //   //       await articlesPyResponseCollection.add(article);
        //   //       console.log(`Article added to Firestore: ${article.title}`);
        //   //     } catch (error) {
        //   //       console.error(`Failed to add article to Firestore: ${error}`);
        //   //       // Handle the error appropriately
        //   //     }
        //   //   }));

        //   // Ensure articlesResponseData is an array before mapping over it
        //   if (Array.isArray(articlesResponseData)) {
        //     await Promise.all(
        //       articlesResponseData.map(async (article: any) => {
        //         try {
        //           await articlesPyResponseCollection.add(article);
        //           console.log(`Article added to Firestore: ${article.title}`);
        //         } catch (error) {
        //           console.error(`Failed to add article to Firestore: ${error}`);
        //         }
        //       })
        //     );
        //   } else {
        //     console.error("Expected articlesResponseData to be an array.");
        //   }

        //   return {
        //     result: "Called get_articles successfully.",
        //     data: articlesResponseData,
        //   };
        // } catch (error) {
        //   console.error("Error calling get_articles:", error);
        //   return { error: "Failed to call get_articles." };
        // }

        console.log("Fetched URLs have been added to the database.");
        return {result: "Fetched URLs have been added to the database."};
      } else {
        console.error(
          "Unexpected API response structure:",
          scrapeResponse.data
        );
        return {error: "Unexpected API response structure."};
      }
    } catch (error) {
      console.error("Error fetching URLs:", error);
      return {error: "Error fetching URLs."};
    }
  }
);
