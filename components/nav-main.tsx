"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { User } from "@/types/user";
import { Collapsible } from "@radix-ui/react-collapsible";
import { ChevronRight, LucideIcon } from "lucide-react";
import Link from "next/link";
import { CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface SubmenuItem {
  title: string;
  url: string;
}

interface NavMainProps {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    submenu?: SubmenuItem[];
  }[];
  currentUser: User | null;
}

export function NavMain({ items, currentUser }: NavMainProps) {
  const userRole = currentUser?.role ?? "";

  const filteredItems = items.map((item) => {
    if (
      item.title === "Incident Reports" &&
      item.submenu &&
      userRole !== "Admin"
    ) {
      return {
        ...item,
        submenu: item.submenu.filter(
          (sub) => sub.title !== "Manage Report Forms" && sub.title !== "Review Reports",
        ),
      };
    }
    return item;
  });

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredItems.map((item) =>
          item.title === "Incident Reports" ? (
            <Collapsible key={item.title} asChild className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.submenu?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title} className="pb-2">
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url!} passHref legacyBehavior>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
