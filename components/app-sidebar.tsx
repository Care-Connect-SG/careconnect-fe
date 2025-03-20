"use client";

import {
  AlertTriangle,
  BookUser,
  Calendar,
  ClipboardList,
  HandHeart,
  Home,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as React from "react";

import { getCurrentUser } from "@/app/api/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { User } from "@/types/user";
import { NavMain } from "./nav-main";
import { NavTeam } from "./nav-team";
import { NavUser } from "./nav-user";
import { SidebarLogo } from "./sidebar-logo";

const config = {
  brand: {
    name: "CareConnect",
    logo: HandHeart,
  },
  navMain: [
    { title: "Home", url: "/dashboard/home", icon: Home },
    { title: "Residents", url: "/dashboard/residents", icon: BookUser },
    { title: "Tasks", url: "/dashboard/tasks", icon: ClipboardList },
    { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
    {
      title: "Incident Reports",
      icon: AlertTriangle,
      submenu: [
        { title: "View All Reports", url: "/dashboard/incidents" },
        { title: "Create A Report", url: "/dashboard/incidents/form" },
        { title: "Manage Report Forms", url: "/dashboard/incidents/admin" },
      ],
    },
  ],
  navTeam: [{ title: "Groups", url: "/dashboard/groups", icon: Users }],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo brand={config.brand} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={config.navMain} currentUser={currentUser} />
      </SidebarContent>
      <SidebarFooter>
        <NavTeam items={config.navTeam} currentUser={currentUser} />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
