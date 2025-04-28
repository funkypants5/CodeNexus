import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { ForumTags } from "../components/ForumTags";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThumbsUp, ThumbsDown } from "lucide-react";

function UserForumPosts() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first!", {
          position: "top-center",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // This will interrupt the rendering process
        throw new Error("User not authenticated");
      }
      fetchData();
    } catch (e) {
      setError(e);
      setTimeout(() => {
        navigate(-1); // This is equivalent to going back one page in history
      }, 3000);
    }
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/userForums`, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      console.log(result);
      setForums(result);
    } catch (e) {
      console.error("Error fetching forums:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a forum post
  const handleDeletePost = async (e, forumId) => {
    // Stop the click event from bubbling up to the Link component
    e.preventDefault();
    e.stopPropagation();

    // Confirm delete action
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/forums/${forumId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove the deleted post from the state
      setForums(forums.filter((forum) => forum._id !== forumId));

      // Show success message
      toast.success("Post deleted successfully!", {
        position: "top-center",
        autoClose: 2500,
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post", {
        position: "top-center",
        autoClose: 2500,
      });
    }
  };

  if (error) {
    return <ToastContainer />;
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold mb-2">
        You haven't created any forum posts yet
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Share your thoughts, ask questions, or start a discussion with the
        community.
      </p>
      <Link to="/addForum">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Your First Post
        </button>
      </Link>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto pt-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Forum Posts</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-8 px-4">
      <ToastContainer />
      <div className="relative mb-6">
        <h1 className="text-2xl font-bold text-center">My Forum Posts</h1>
        <Link to="/addForum">
          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Post
          </button>
        </Link>
      </div>

      {forums.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forums.map((forum) => (
            <div key={forum._id} className="relative">
              <Link to={`/discussion/${forum._id}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="text-center">
                    <div className="relative">
                      <CardTitle className="text-lg">{forum.title}</CardTitle>
                      <div className="absolute top-0 right-0 flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-blue-600">
                          <ThumbsUp size={16} />
                          <span className="text-sm font-medium">
                            {forum.likes || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-red-600">
                          <ThumbsDown size={16} />
                          <span className="text-sm font-medium">
                            {forum.dislikes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription>user: {forum.author}</CardDescription>
                    <div className="mt-2">
                      <ForumTags initialSelectedTags={forum.tags} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm line-clamp-3">
                        {forum.discussionBody}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2">
                    <Link
                      to={`/editPost/${forum._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={(e) => handleDeletePost(e, forum._id)}
                      className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </CardFooter>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserForumPosts;
