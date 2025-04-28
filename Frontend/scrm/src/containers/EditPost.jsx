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
import { Link, useParams, useNavigate } from "react-router-dom";
import { ForumTags } from "../components/ForumTags";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:3000";

function EditPost() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    discussionBody: "",
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagsChange = (selectedTags) => {
    setFormData((prev) => ({
      ...prev,
      tags: selectedTags,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const dataToSubmit = {
        ...formData,
        tags: JSON.stringify(formData.tags),
      };
      const response = await fetch(`${API_URL}/api/forums/${id}/edit`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        throw new Error("Failed to update discussion");
      }

      setSuccess(true);
      toast.success("Forum updated successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Navigate back after successful update
      setTimeout(() => {
        navigate(`/myForum`); // Navigate to the forum post view
      }, 2000);
    } catch (e) {
      setError(e.message);
      console.error("Error updating forum:", e);
      toast.error("Failed to update discussion", {
        position: "top-center",
        autoClose: 2500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        const response = await fetch(`${API_URL}/api/forums/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        // Parse tags if they're stored as a string
        let parsedTags = result.tags;
        if (typeof result.tags === "string") {
          try {
            parsedTags = JSON.parse(result.tags);
          } catch (e) {
            console.error("Error parsing tags:", e);
            parsedTags = [];
          }
        }

        setFormData({
          title: result.title || "",
          discussionBody: result.discussionBody || "",
          tags: parsedTags || [],
        });

        setIsLoading(false);
      } catch (e) {
        setError(e.message);
        setIsLoading(false);
        console.error("Error fetching forum:", e);
        toast.error(e.message, {
          position: "top-center",
          autoClose: 2500,
        });
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <ToastContainer />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto pt-8 px-4 text-center">
        <p>Loading forum data...</p>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-8 px-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Edit Discussion</h1>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit Discussion Topic</CardTitle>
            <CardDescription>
              Update your discussion with the community
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter discussion title"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="discussionBody" className="block font-medium">
                Discussion
              </label>
              <textarea
                id="discussionBody"
                name="discussionBody"
                value={formData.discussionBody}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 min-h-32"
                placeholder="Write your discussion content here..."
                required
              />
            </div>

            <div className="space-y-5">
              <label className="block font-large">Tags</label>
              <ForumTags
                initialSelectedTags={formData.tags}
                onTagsChange={handleTagsChange}
                editable={true}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mt-6">
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-end w-full md:w-auto space-x-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? "Updating..." : "Update Discussion"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
      <ToastContainer />
    </div>
  );
}

export default EditPost;
