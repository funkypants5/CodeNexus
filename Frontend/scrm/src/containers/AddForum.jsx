import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForumTags } from "../components/ForumTags";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:3000";

function AddForum() {
  const [formData, setFormData] = useState({
    title: "",
    discussionBody: "",
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
    console.log(formData.tags);

    try {
      const token = localStorage.getItem("token");
      const dataToSubmit = {
        ...formData,
        tags: JSON.stringify(formData.tags),
      };

      const response = await fetch(`${API_URL}/api/forums`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        throw new Error("Failed to create discussion");
      }

      setSuccess(true);
      setFormData({
        title: "",
        discussionBody: "",
        tags: [],
      });

      // Reset success message after 3 seconds
      toast.success("Forum created successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Navigate back after successful update
      setTimeout(() => {
        navigate(`/myForum`); // Navigate to the forum post view
      }, 2000);
    } catch (e) {
      setError(e.message);
      console.error("Error creating forum:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    } catch (e) {
      setError(e);
      setTimeout(() => {
        navigate(-1); // This is equivalent to going back one page in history
      }, 3000);
    }
  }, []);

  if (error) {
    return <ToastContainer />;
  }

  return (
    <div className="container mx-auto pt-8 px-4">
      <ToastContainer />;
      <h1 className="text-2xl font-bold mb-6">Create New Discussion</h1>
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>New Discussion Topic</CardTitle>
            <CardDescription>
              Share your thoughts or questions with the community
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
                {isSubmitting ? "Creating..." : "Create Discussion"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: "",
                    discussionBody: "",
                    tags: [],
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default AddForum;
