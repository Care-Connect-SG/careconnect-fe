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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Define main menu items (without Profile)
const mainItems = [
  { title: "Home", url: "/dashboard/home", icon: Home },
  { title: "Tasks", url: "/dashboard/tasks", icon: ClipboardList },
  { title: "Residents", url: "/dashboard/residents", icon: Users },
  { title: "Incident Reports", url: "/dashboard/incidents", icon: AlertTriangle },
  { title: "Announcement", url: "/dashboard/announcement", icon: Megaphone },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
];

// Define bottom items (Group & Settings)
const bottomItems = [
  { title: "Group", url: "/dashboard/group", icon: UsersRound },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar(); // Detect if the sidebar is collapsed

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <div className="flex items-center justify-between p-4">
            {/* Sidebar Logo */}
            <SidebarGroupLabel>CareConnect</SidebarGroupLabel>

            {/* Sidebar Toggle Button (Collapsible Icon) */}
            <SidebarTrigger className="text-gray-500 hover:text-gray-700" />
          </div>

          {/* Main Menu Items */}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="flex-1"></div> {/* Spacer to push items down */}

          {/* Bottom Items */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        {/* Profile Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button className="flex items-center gap-3 w-full">
                        {/* Profile Picture */}
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          alt="Profile"
                          className="w-6 h-6 rounded-full"
                        />
                        {/* Username */}
                        <span>John Doe</span>
                        {/* Chevron Icon */}
                        <ChevronRight className="ml-auto" />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8}>
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-3" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Show a floating button when the sidebar is collapsed */}
      {state === "collapsed" && (
        <div className="fixed top-4 left-4 z-50">
          <SidebarTrigger className="bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300" />
        </div>
      )}
    </Sidebar>
  );
}
