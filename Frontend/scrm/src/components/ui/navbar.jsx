import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth status when component mounts and when location changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    // Set up storage event listener to detect changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        checkAuthStatus();
      }
    };

    // Check auth status initially and when location changes
    checkAuthStatus();

    // Listen for storage events (helpful for multi-tab scenarios)
    window.addEventListener("storage", handleStorageChange);

    // Clean up event listener
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [location]); // Re-run effect when location changes

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="w-full bg-background border-b border-border h-16 flex items-center px-4">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">
          <Link to="/Discussion" className="flex items-center">
            <CodeNexusIcon className="h-6 w-6 text-primary" />
            <span className="font-bold ml-2 text-primary">CodeNexus</span>
          </Link>
          <nav className="hidden md:flex gap-4 flex">
            <Link
              to="/Discussion"
              className="font-medium flex items-center text-sm transition-colors hover:underline"
            >
              Discussion Forum
            </Link>
            <Link
              to="/profile"
              className="font-medium flex items-center text-sm transition-colors hover:underline"
            >
              My Profile
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function CodeNexusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Central hub */}
      <circle cx="12" cy="12" r="3" />
      {/* Vertical lines */}
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="12" y1="17" x2="12" y2="22" />
      {/* Horizontal lines */}
      <line x1="2" y1="12" x2="7" y2="12" />
      <line x1="17" y1="12" x2="22" y2="12" />
      {/* Diagonal lines */}
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}
