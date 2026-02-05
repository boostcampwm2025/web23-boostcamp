import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/app/components/ui/sidebar";

import { Command, FileText, Waypoints } from "lucide-react";
import Link from "next/link";
import React from "react";
import { NavUser } from "./nav-user";
import { getUserSession } from "@/app/lib/server/session";

// home(dashboard), documents
const menuData = [
  {
    label: "대시보드",
    icon: Command,
    href: "/dashboard",
  },
  {
    label: "서류",
    icon: FileText,
    href: "/documents",
  },
  {
    label: "면접 시뮬레이터",
    icon: Waypoints,
    href: "/interview/create",
  },
];

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = await getUserSession();

  if (!user) {
    return null;
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton size="lg" asChild tooltip="Synapse">
          <Link href="/dashboard" aria-label="Synapse">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Waypoints className="size-4" />
            </div>
            <span className="text-xl font-semibold text-primary uppercase">
              Synapse
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href} aria-label={item.label}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            avatar: user.profileUrl || "",
            email: user.email,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
