import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar";
import { Command, Waypoints } from "lucide-react";
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
    label: "면접 시뮬레이터",
    icon: Waypoints,
    href: "/simulator/interview/create",
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
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Waypoints className="size-4" />
                </div>
                <span className="text-xl font-semibold text-primary uppercase">
                  Synapse
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuData.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild>
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: user.profileUrl || "",
            email: user.email,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
