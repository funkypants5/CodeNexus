import React from "react";
import "./App.css";
import LandingPage from "./containers/LandingPage";
import { Routes, Route } from "react-router-dom";
import ProfilePage from "./containers/ProfilePage";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "./components/ui/navbar";
import DiscussionPage from "./containers/DiscussionPage";
import UserForumPosts from "./containers/UserForumPosts";
import DiscussionPost from "./containers/DiscussionPost";
import AddForum from "./containers/AddForum";
import LoginPage from "./containers/LoginPage";
import SignUpPage from "./containers/SignUpPage";
import EditPost from "./containers/EditPost";

function App() {
  return (
    <div className="">
      <div className="z-50">
        <Navbar className="z-50" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider className="flex flex-1 overflow-hidden">
          <div>
            <AppSidebar />
          </div>
          <div className="flex-1 relative">
            <SidebarTrigger className="absolute top-4 left-2 sm:left-4 md:left-6 lg:left-8 z-50" />
            <main className="w-full h-full overflow-y-auto pb-8">
              <Routes>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/discussion/:id" element={<DiscussionPost />} />
                <Route path="/discussion" element={<DiscussionPage />} />
                <Route path="/editPost/:id" element={<EditPost />} />
                <Route path="/addForum" element={<AddForum />} />
                <Route path="/myForum" element={<UserForumPosts />} />
                <Route path="/" element={<LandingPage />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}

export default App;
