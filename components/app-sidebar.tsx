"use client";

import {
  AlertTriangle,
  BookUser,
  Calendar,
  ClipboardList,
  HandHeart,
  Home,
  Megaphone,
  Users,
} from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
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
    {
      title: "Announcements",
      url: "/dashboard/announcements",
      icon: Megaphone,
    },
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
  navTeam: [{ title: "Group", url: "/dashboard/group", icon: Users }],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo brand={config.brand} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={config.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavTeam items={config.navTeam} />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
