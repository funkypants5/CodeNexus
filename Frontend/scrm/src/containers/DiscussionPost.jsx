import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import "../App.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ForumTags } from "../components/ForumTags";
import {
  Pencil,
  Trash,
  ThumbsUp,
  ThumbsDown,
  Send,
  Clock,
  MessageSquare,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";

const API_URL = "http://localhost:3000";

function DiscussionPost() {
  const { id } = useParams();
  const [selectedForum, setSelectedForum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Keep all the existing handler functions unchanged
  useEffect(() => {
    const fetchData = async () => {
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
          throw new Error("User not authenticated");
        }

        setIsLoading(true);

        // Get user profile to determine the current user ID
        const profileResponse = await fetch(`${API_URL}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const userProfile = await profileResponse.json();
          setUserId(userProfile._id);
        }

        // Get forum post
        const forumResponse = await fetch(`${API_URL}/api/forums/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!forumResponse.ok) {
          throw new Error("Failed to fetch forum data");
        }
        const result = await forumResponse.json();

        // Get replies
        const repliesResponse = await fetch(`${API_URL}/api/replies/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!repliesResponse.ok) {
          throw new Error("Failed to fetch replies");
        }

        const fetchedReplies = await repliesResponse.json();

        setSelectedForum(result);
        setReplies(fetchedReplies);
        setIsLoading(false);
      } catch (e) {
        setError(e.message);
        setIsLoading(false);
        console.error("Error fetching data:", e);
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Handler functions remain unchanged
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/forums/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ replyText: newReply }),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      // Refresh replies
      const repliesResponse = await fetch(`${API_URL}/api/replies/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedReplies = await repliesResponse.json();
      setReplies(fetchedReplies);
      setNewReply("");
      toast.success("Reply posted successfully!");
    } catch (err) {
      console.error("Error posting reply:", err);
      toast.error("Failed to post reply");
    }
  };

  const handleEditReply = async () => {
    if (!editReplyText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/forums/${id}/replies/${editingReplyId}/edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ replyText: editReplyText }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit reply");
      }

      // Refresh replies
      const repliesResponse = await fetch(`${API_URL}/api/replies/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedReplies = await repliesResponse.json();
      setReplies(fetchedReplies);
      setEditingReplyId(null);
      setEditReplyText("");
      toast.success("Reply updated successfully!");
    } catch (err) {
      console.error("Error editing reply:", err);
      toast.error("Failed to update reply");
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/forums/${id}/replies/${replyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete reply");
      }

      // Update replies list without fetching again
      setReplies(replies.filter((reply) => reply._id !== replyId));
      toast.success("Reply deleted successfully!");
    } catch (err) {
      console.error("Error deleting reply:", err);
      toast.error("Failed to delete reply");
    }
  };

  const handleLikePost = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/forums/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      // Refresh forum data to get updated likes count
      const forumResponse = await fetch(`${API_URL}/api/forums/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedForum = await forumResponse.json();
      setSelectedForum(updatedForum);
    } catch (err) {
      console.error("Error liking post:", err);
      toast.error("Failed to like post");
    }
  };

  const handleDislikePost = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/forums/${id}/dislike`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to dislike post");
      }

      // Refresh forum data
      const forumResponse = await fetch(`${API_URL}/api/forums/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedForum = await forumResponse.json();
      setSelectedForum(updatedForum);
    } catch (err) {
      console.error("Error disliking post:", err);
      toast.error("Failed to dislike post");
    }
  };

  const handleLikeReply = async (replyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/forums/${id}/replies/${replyId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to like reply");
      }

      // Refresh replies
      const repliesResponse = await fetch(`${API_URL}/api/replies/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedReplies = await repliesResponse.json();
      setReplies(fetchedReplies);
    } catch (err) {
      console.error("Error liking reply:", err);
      toast.error("Failed to like reply");
    }
  };

  const handleDislikeReply = async (replyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/forums/${id}/replies/${replyId}/dislike`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to dislike reply");
      }

      // Refresh replies
      const repliesResponse = await fetch(`${API_URL}/api/replies/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedReplies = await repliesResponse.json();
      setReplies(fetchedReplies);
    } catch (err) {
      console.error("Error disliking reply:", err);
      toast.error("Failed to dislike reply");
    }
  };

  // Helper function to get initials from username
  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";
  };

  // Function to format dates - this assumes the data includes a createdAt field
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Recently";
    }
  };

  if (error) {
    return <ToastContainer />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto pt-8 px-4 flex justify-center">
        <div className="w-full max-w-4xl text-center">
          <div className="flex flex-col items-center justify-center h-60">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-600">Loading discussion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-8 px-4 pb-12">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/discussion"
            className="text-blue-600 hover:underline flex items-center gap-1 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Forums
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Discussion Thread
          </h1>
        </div>

        {selectedForum && (
          <Card className="w-full shadow-md mb-8 rounded-lg overflow-hidden border border-gray-200">
            <CardHeader className="bg-gradient-to-r  pb-4 border-b">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getInitials(selectedForum.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {selectedForum.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <span className="font-medium">
                          {selectedForum.author}
                        </span>
                        {selectedForum.createdAt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center text-sm">
                              <Clock size={14} className="mr-1" />
                              {formatDate(selectedForum.createdAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end md:self-start">
                  <Button
                    variant={
                      selectedForum.likedBy?.includes(userId)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={handleLikePost}
                    className={`flex items-center gap-1 ${
                      selectedForum.likedBy?.includes(userId)
                        ? "bg-blue-600 text-white"
                        : "text-gray-700"
                    }`}
                  >
                    <ThumbsUp size={16} />
                    <span>{selectedForum.likes || 0}</span>
                  </Button>
                  <Button
                    variant={
                      selectedForum.dislikedBy?.includes(userId)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={handleDislikePost}
                    className={`flex items-center gap-1 ${
                      selectedForum.dislikedBy?.includes(userId)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    <ThumbsDown size={16} />
                    <span>{selectedForum.dislikes || 0}</span>
                  </Button>
                </div>
              </div>
              <div className="mt-3">
                <ForumTags initialSelectedTags={selectedForum.tags} />
              </div>
            </CardHeader>

            <CardContent className="pt-6 pb-6 text-gray-700 whitespace-pre-line">
              <div className="prose max-w-none">
                {selectedForum.discussionBody}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Replies section */}
        <div className="mt-6 mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare size={20} />
            Replies
            <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {replies.length}
            </span>
          </h2>
        </div>

        {/* Reply form */}
        <Card className="mb-8 border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="pt-4 pb-4">
            <form onSubmit={handleReplySubmit} className="w-full">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9 mt-1">
                  <AvatarFallback className="bg-indigo-500 text-white">
                    {userId ? getInitials("Me") : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add to the discussion..."
                    className="w-full p-3 border rounded-md min-h-24 focus:ring-2 focus:ring-blue-500"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <Button type="submit" className="flex items-center gap-2">
                      <Send size={16} /> Post Reply
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {replies.length > 0 ? (
          <div className="space-y-4">
            {replies.map((reply, index) => (
              <Card
                key={reply._id}
                className="w-full shadow-sm rounded-lg border border-gray-200 overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                        {getInitials(reply.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {reply.username}
                          </span>
                          {reply.createdAt && (
                            <span className="text-sm text-gray-500 ml-2">
                              {formatDate(reply.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button
                            onClick={() => handleLikeReply(reply._id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              reply.likedBy?.includes(userId)
                                ? "bg-blue-100 text-blue-600"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            <ThumbsUp size={14} />
                            <span>{reply.likes || 0}</span>
                          </button>
                          <button
                            onClick={() => handleDislikeReply(reply._id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              reply.dislikedBy?.includes(userId)
                                ? "bg-red-100 text-red-600"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            <ThumbsDown size={14} />
                            <span>{reply.dislikes || 0}</span>
                          </button>
                          {userId === reply.userId && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingReplyId(reply._id);
                                  setEditReplyText(reply.replyText);
                                }}
                                className="p-1 text-gray-500 rounded hover:bg-gray-100"
                                title="Edit reply"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteReply(reply._id)}
                                className="p-1 text-gray-500 rounded hover:bg-gray-100"
                                title="Delete reply"
                              >
                                <Trash size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {editingReplyId === reply._id ? (
                        <div className="space-y-2 mt-2">
                          <Textarea
                            className="w-full p-2 border rounded-md"
                            value={editReplyText}
                            onChange={(e) => setEditReplyText(e.target.value)}
                            required
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingReplyId(null)}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleEditReply}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-gray-700 whitespace-pre-line">
                          {reply.replyText}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                {index < replies.length - 1 && <Separator className="mx-5" />}
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 text-gray-500 p-8 text-center border rounded-lg">
            <MessageSquare size={36} className="mx-auto mb-2 text-gray-400" />
            <p className="text-lg">No replies yet</p>
            <p className="text-sm mt-1">
              Be the first one to reply to this discussion!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscussionPost;
