import { User, BookCheck, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import "../index.css";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "My Forum Post",
    url: "/myForum",
    icon: BookCheck,
  },

  {
    title: "Add a Forum Post",
    url: "/addForum",
    icon: Plus,
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4">
            <h1 className="text-base">
              <Link to="/" className="flex items-center">
                <CodeNexusIcon className="h-5 w-5 text-primary" />{" "}
                <span className="font-semibold ml-2 text-primary">
                  CodeNexus
                </span>
              </Link>
            </h1>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function CodeNexusIcon(props) {
  return (
    <svg
      {...props} // This spreads all props including className
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
