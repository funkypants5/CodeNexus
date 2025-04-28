import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "../App.css";
import { Link } from "react-router-dom";
import { ForumTags } from "../components/ForumTags";
import { ThumbsUp, Search, Filter, SortAsc, SortDesc } from "lucide-react";

const API_URL = "http://localhost:3000";

function DiscussionPage() {
  const [forums, setForums] = useState([]);
  const [filteredForums, setFilteredForums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/forums`, {
          method: "get",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setForums(result);
        setFilteredForums(result);

        // Extract all unique tags from forums
        const allTags = new Set();
        result.forEach((forum) => {
          if (forum.tags && Array.isArray(forum.tags)) {
            forum.tags.forEach((tag) => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags));

        setIsLoading(false);
      } catch (e) {
        setError(e.message);
        setIsLoading(false);
        console.error("Error fetching forums:", e);
      }
    };

    fetchData();
  }, []);

  // Apply filters and sorting whenever any filter criteria changes
  useEffect(() => {
    let result = [...forums];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (forum) =>
          forum.title.toLowerCase().includes(query) ||
          (forum.discussionBody &&
            forum.discussionBody.toLowerCase().includes(query)) ||
          forum.author.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(
        (forum) =>
          forum.tags && selectedTags.every((tag) => forum.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "mostLikes":
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }

    setFilteredForums(result);
  }, [searchQuery, selectedTags, sortOption, forums]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSortOption("newest");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto pt-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-6">Discussion Forum</h1>
        <p>Loading forums...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto pt-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-6">Discussion Forum</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-16">
      <h1 className="text-2xl font-bold mb-6">Discussion Forum</h1>

      {/* Search and Filter UI */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium mr-2">Filter by tags:</span>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {(searchQuery || selectedTags.length > 0) && (
              <button
                onClick={handleClearFilters}
                className="ml-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="mostLikes">Most Likes</option>
            </select>
            {sortOption === "newest" || sortOption === "oldest" ? (
              sortOption === "newest" ? (
                <SortDesc className="h-5 w-5 text-gray-500" />
              ) : (
                <SortAsc className="h-5 w-5 text-gray-500" />
              )
            ) : (
              <ThumbsUp className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {filteredForums && filteredForums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredForums.map((forum) => (
            <Link
              to={`/discussion/${forum._id}`}
              key={forum.id || forum._id}
              className="block"
            >
              <Card className="h-full hover:shadow-md transition-shadow relative">
                <CardHeader className="pb-4">
                  <div className="relative">
                    <CardTitle className="text-lg">{forum.title}</CardTitle>
                    <div className="absolute top-0 right-0 flex items-center space-x-1 text-blue-600">
                      <ThumbsUp size={18} />
                      <span className="text-sm font-medium">{forum.likes}</span>
                    </div>
                  </div>
                  <CardDescription>Posted by: {forum.author}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-l">
                      {forum.discussionBody?.substring(0, 120)}
                      {forum.discussionBody &&
                        forum.discussionBody.length > 120 &&
                        "..."}
                    </p>
                  </div>

                  {forum.tags && (
                    <ForumTags
                      initialSelectedTags={forum.tags}
                      onTagsChange={() => {}}
                      readOnly={true}
                    />
                  )}
                </CardContent>

                <CardFooter className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {forum.createdAt &&
                      new Date(forum.createdAt).toLocaleDateString()}
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Read More
                  </button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No discussions found.</p>
          {(searchQuery || selectedTags.length > 0) && (
            <button
              onClick={handleClearFilters}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DiscussionPage;
