"use client";

import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  ClipboardList,
  Home,
  LogOut,
  Megaphone,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchUser } from "@/app/api/user/route";

const mainItems = [
  { title: "Home", url: "/dashboard/home", icon: Home },
  { title: "Tasks", url: "/dashboard/tasks", icon: ClipboardList },
  { title: "Residents", url: "/dashboard/residents", icon: Users },
  {
    title: "Incident Reports",
    url: "/dashboard/incidents",
    icon: AlertTriangle,
  },
  { title: "Announcements", url: "/dashboard/announcements", icon: Megaphone },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
];

const bottomItems = [
  { title: "Group", url: "/dashboard/group", icon: UsersRound },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    const getUserRole = async () => {
      if (!session?.user?.email) return;

      const user = await fetchUser(session.user.email);
      setUserRole(user.role);
    };

    getUserRole();
  }, [session?.user?.email]);

  // Conditionally render the "Users" tab if the userRole is "Admin"
  const updatedMainItems =
    userRole === "Admin"
      ? [...mainItems, { title: "Nurses", url: "/dashboard/nurses", icon: Users }]
      : mainItems;

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col h-full">
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
              {updatedMainItems.map((item) => (
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
        <div className="flex-1"></div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Button className="flex items-center gap-3 w-full bg-transparent text-black">
                        {status === "loading" ? (
                          <Spinner />
                        ) : (
                          <>
                            {/* <Image
                              src="/url"
                              alt="Profile"
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                            /> */}
                            <span>{session?.user?.email}</span>
                            <ChevronRight className="ml-auto" />
                          </>
                        )}
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8}>
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
