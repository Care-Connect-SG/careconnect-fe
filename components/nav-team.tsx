"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "@/types/user";
import { UserCheck } from "lucide-react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface NavTeamItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

interface NavTeamProps {
  items: NavTeamItem[];
  currentUser: User | null;
}

export function NavTeam({ items, currentUser }: NavTeamProps) {
  const updatedItems =
    currentUser?.role === "Admin"
      ? [
          ...items,
          { title: "Nurses", url: "/dashboard/nurses", icon: UserCheck },
        ]
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
