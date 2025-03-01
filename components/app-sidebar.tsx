"use client";

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
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const { state } = useSidebar();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between p-4 pl-2">
            <SidebarGroupLabel className="p-0">
              <Image
                src="/careconnect.png"
                alt="CareConnect Logo"
                className="h-5 w-auto object-contain hover:cursor-pointer"
                width={2154}
                height={972}
                onClick={() => router.push("/dashboard/home")}
              />
            </SidebarGroupLabel>
            <SidebarTrigger className="text-gray-500 hover:text-blue-600" />
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

      {state === "collapsed" && (
        <div className="fixed top-6 left-4 z-10">
          <SidebarTrigger className="bg-white text-gray-500 hover:text-blue-600" />
        </div>
      )}
    </Sidebar>
  );
}
