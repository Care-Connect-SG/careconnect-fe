"use client"; // Ensure this is a Client Component

import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  Home,
  Megaphone,
  Settings,
  User,
  Users,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger, // Add SidebarTrigger here
  useSidebar, // Add useSidebar here
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard/home",
    icon: Home,
  },
  {
    title: "Tasks",
    url: "/dashboard/tasks",
    icon: ClipboardList,
  },
  {
    title: "Residents",
    url: "/dashboard/residents",
    icon: Users,
  },
  {
    title: "Incident Reports",
    url: "/dashboard/incidents",
    icon: AlertTriangle,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Announcement",
    url: "/dashboard/announcement",
    icon: Megaphone,
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Group",
    url: "/dashboard/group",
    icon: UsersRound,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar(); //  Detect if the sidebar is collapsed

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between p-4">
            {/* Sidebar Logo */}
            <SidebarGroupLabel>CareConnect</SidebarGroupLabel>

            {/* Sidebar Toggle Button (Collapsible Icon) */}
            <SidebarTrigger className="text-gray-500 hover:text-gray-700" />
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ✅ Show a floating button when the sidebar is collapsed */}
      {state === "collapsed" && (
        <div className="fixed top-4 left-4 z-50">
          <SidebarTrigger className="bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300" />
        </div>
      )}
    </Sidebar>
  );
}
