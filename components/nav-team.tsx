"use client";

import { fetchUser } from "@/app/api/user";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function NavTeam({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState();

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
  const updatedItems =
    userRole === "Admin"
      ? [...items, { title: "Nurses", url: "/dashboard/nurses", icon: User }]
      : items;
  return (
    <SidebarGroup className="p-0">
      <SidebarMenu>
        {updatedItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <Link href={item.url} passHref legacyBehavior>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
