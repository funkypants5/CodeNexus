import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "../App.css";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
    profilePic: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();
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
    } catch (e) {
      setError(e);
      setTimeout(() => {
        navigate(-1); // This is equivalent to going back one page in history
      }, 3000);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle file selection
  useEffect(() => {
    // Create preview URL when file is selected
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);

    // Clean up
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedFile]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
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

      setProfile({
        username: result.username || "",
        bio: result.bio || "",
        email: result.email || "",
        profilePic: result.profilePic,
      });
    } catch (e) {
      setError(e.message);
      console.error("Error fetching profile:", e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validate file type
      if (!file.type.match("image.*")) {
        toast.error("Please select an image file (jpg, jpeg, png, gif)");
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // Use FormData to handle file uploads
      const formData = new FormData();
      formData.append("username", profile.username);
      formData.append("email", profile.email);
      formData.append("bio", profile.bio);

      // Add file to FormData if selected
      if (selectedFile) {
        formData.append("profilePic", selectedFile);
      }

      const response = await fetch(`${API_URL}/api/profile/update`, {
        method: "post",
        headers: {
          // Don't set Content-Type with FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      setProfile(result);
      setSelectedFile(null); // Reset selected file after successful upload

      toast.success("Profile updated successfully!", {
        position: "top-center",
        autoClose: 2500,
      });
    } catch (e) {
      setError(e.message);
      console.error("Error updating profile:", e);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    fetchData();
  };

  if (error) {
    return <ToastContainer />;
  }

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-32 w-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center relative group">
                {/* Profile picture or placeholder */}
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : profile && profile.profilePic ? (
                  <img
                    src={`${API_URL}${profile.profilePic}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ""; // Set to empty to show fallback
                      e.target.parentNode.classList.add("fallback-active");
                    }}
                  />
                ) : (
                  <span className="text-5xl text-gray-400">👤</span>
                )}

                {/* Overlay with edit icon */}
                <label
                  htmlFor="profile-pic-input"
                  className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>

                {/* Hidden file input */}
                <input
                  id="profile-pic-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <CardTitle className="text-2xl">User Profile</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                type="string"
                value={profile.username}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="johndoe"
                onChange={handleChange}
                name="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={profile.email}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="john.doe@example.com"
                onChange={handleChange}
                name="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                className="w-full px-4 py-2 border rounded-md"
                rows="5"
                value={profile.bio || ""}
                placeholder="Tell us about yourself..."
                onChange={handleChange}
                name="bio"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <button
              className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={updateProfile}
            >
              Save Changes
            </button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default ProfilePage;
