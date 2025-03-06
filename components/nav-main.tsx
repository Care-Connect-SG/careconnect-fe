"use client";

import { fetchUser } from "@/app/api/user";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible } from "@radix-ui/react-collapsible";
import { LucideIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";


interface submenuItem {
  title: string;
  url: string;
}

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    submenu?: submenuItem[];
  }[];
}) {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const getRole = async () => {
      if (!session?.user?.email) return;
      const user = await fetchUser(session.user.email);
      setUserRole(user.role);
    };
    getRole();
  }, [session?.user?.email]);

  const filteredItems = items.map((item) => {
    if (item.title === "Incident Reports" && item.submenu && userRole !== "Admin") {
      return {
        ...item,
        submenu: item.submenu.filter((sub) => sub.title !== "Manage Report Forms"),
      };
    }
    return item;
  });

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredItems.map((item) => (
          item.title === "Incident Reports" ?
            <Collapsible key={item.title}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.submenu?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            :
            <SidebarMenuItem key={item.title}>
              <Link href={item.url!} passHref legacyBehavior>
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
