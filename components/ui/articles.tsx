import React, { useState } from "react";
import Image from "next/image";
import Masonry from "@mui/lab/Masonry"; // Import from MUI
import ArticleDialog from "./ArticleDialog";
import DetailedView from "./DetailedView";
import MessagesProvider, { useMessages } from "@/datasources/messagesContext";
import { Close as CloseIcon } from "@mui/icons-material";

function formatDate(isoDateString) {
  if (!isoDateString || isoDateString === "Unknown") return "Not Given";
  const date = new Date(isoDateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

function ArticlesComponent({ articles, articlesJson, isLoading, isEmpty }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All"); // New state for selected tag
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [detailedArticle, setDetailedArticle] = useState(null);

  // Function to handle dialog open
  const handleOpenDialog = (article) => {
    setSelectedArticle(article);
  };

  // Function to handle detailed view open
  const handleOpenDetailedView = (article) => {
    setDetailedArticle(article);
  };

  // Function to handle dialog close
  const handleCloseDialog = () => {
    setSelectedArticle(null);
  };

  // Function to handle dialog close
  const handleCloseDetailedView = () => {
    setDetailedArticle(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Image
          src="/images/commonwealth.png"
          alt="Loading..."
          width={100}
          height={100}
          className="animate-spin"
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col justify-center items-center col-span-1">
        <Image
          src="/images/commonwealth.png"
          alt="Loading..."
          width={100}
          height={100}
          className="mb-3 animate-bounce"
        />
        <div className="text-slate-500 font-lg text-xl">
          There are no available articles, refresh your database.
        </div>
      </div>
    );
  }

  // Extract all unique tags from articles for the filter options
  const allTags = Array.from(
    new Set(articles.flatMap((article) => article.tags))
  ).sort();

  // Function to handle tag selection
  const handleTagSelection = (e) => {
    setSelectedTag(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Image
          src="/images/commonwealth.png"
          alt="Loading..."
          width={100}
          height={100}
          className="animate-spin"
        />
      </div>
    );
  }

  // Function to extract the hostname for grouping
  // const getHostname = (url) => {
  //   return new URL(url).hostname.replace('www.', '').split('.')[0].toUpperCase();
  // };

  const getHostname = (url) => {
    let hostname = new URL(url).hostname;
    // Remove 'www.' if present
    hostname = hostname.replace("www.", "");
    // Split the hostname at the last '.' to isolate the main part of the domain
    const parts = hostname.split(".");
    if (parts.length > 1) {
      return parts.slice(0, -1).join(".").toUpperCase(); // Join everything except the last part
    }
    return hostname.toUpperCase(); // Return the modified hostname in uppercase
  };

  // Group articles by source
  const groupedArticles = articles.reduce((group, article) => {
    const source = getHostname(article.url);
    if (!group[source]) {
      group[source] = [];
    }
    group[source].push(article);
    return group;
  }, {});

  // Updated filtering logic to include tag filtering
  const filteredArticles = Object.entries(groupedArticles).reduce(
    (acc, [source, articles]) => {
      const filtered = articles.filter(
        (article) =>
          article.text.trim() !== "" &&
          article.tags &&
          article.tags.length > 0 &&
          (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (selectedTag === "All" || article.tags.includes(selectedTag)) // Filter by selected tag
      );
      if (filtered.length > 0) {
        acc[source] = filtered;
      }
      return acc;
    },
    {}
  );

  // Filter out groups with no articles to display
  const groupsToDisplay = Object.entries(filteredArticles).filter(
    ([source, articles]) => articles.length > 0
  );

  const breakpointColumnsObj = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 3,
    xl: 3,
  };

  return (
    <>
      <div className="p-4 flex justify-between mb-8">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-purple-300 rounded-xl mr-1"
        />
        {/* Tag selection dropdown */}
        <select
          value={selectedTag}
          onChange={handleTagSelection}
          className="p-2 border border-purple-300 bg-purple-100 text-gray-800 rounded-xl font-medium"
        >
          <option value="All">All Tags</option>
          {allTags.map((tag, index) => (
            <option key={index} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <Masonry
        columns={breakpointColumnsObj} // Use responsive columns object
        spacing={2}
      >
        {Object.entries(filteredArticles).map(([source, articles]) => (
          <div
            key={source}
            className="bg-white shadow-lg overflow-hidden rounded-2xl mb-4"
          >
            <h2 className="px-4 py-5 text-lg leading-6 font-medium text-white bg-purple-900 bg-opacity-75 border-b border-gray-200">
              {source}
            </h2>
            <ul className="divide-y divide-gray-200">
              {articles.map(
                (article, index) =>
                  // Check if article.text is not empty before rendering the article div
                  article.text.trim() !== "" &&
                  article.tags &&
                  article.tags.length > 0 && (
                    <li key={index} className="px-4 py-4 sm:px-6">
                      <article className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className="flex-1">
                          <h3 className="text-md font-semibold text-gray-800">
                            {article.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {article.text}...
                          </p>
                          {/* Use formatDate to display the publication date */}
                          {formatDate(article.publish_date) !== "Not Given" && (
                            <p className="text-sm text-black font-medium mt-2">
                              Published on: {formatDate(article.publish_date)}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {article.tags.map((tag, tagIndex) => (
                              <div
                                key={tagIndex}
                                className="bg-gray-200 px-3 py-1.5 rounded-full font-medium text-sm text-gray-800"
                              >
                                {tag}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-center">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-900 hover:text-purple-900 font-medium mb-2 text-center"
                          >
                            Read more
                          </a>
                          <div
                            className="text-white bg-purple-800 hover:bg-purple-400 font-medium px-2 py-1 rounded-xl flex items-center justify-center cursor-pointer"
                            onClick={() => handleOpenDialog(article)} // Add onClick handler
                          >
                            <Image
                              src="/images/commonwealth.png"
                              alt="Loading..."
                              width={30}
                              height={30}
                            />
                            <span>Chat with me</span>
                          </div>
                          <div
                            className="text-white bg-purple-500 hover:bg-purple-400 font-medium px-2 py-1 rounded-xl mt-2 flex items-center justify-center cursor-pointer"
                            onClick={() => handleOpenDetailedView(article)} // Add onClick handler
                          >
                            <span>Detailed View</span>
                          </div>
                        </div>
                      </article>
                    </li>
                  )
              )}
            </ul>
          </div>
        ))}
        {/* </div> */}
      </Masonry>

      <MessagesProvider>
        <ArticleDialog
          open={!!selectedArticle}
          onClose={handleCloseDialog}
          article={selectedArticle || {}}
        />
      </MessagesProvider>

      <DetailedView
        open={!!detailedArticle}
        onClose={() => setDetailedArticle(null)}
        article={detailedArticle || {}}
      />
    </>
  );
}

export default ArticlesComponent;
