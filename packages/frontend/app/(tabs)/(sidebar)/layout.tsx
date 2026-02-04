import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar";
import { cookies } from "next/headers";

import { AppSidebar } from "./dashboard/components/app-sidebar";

export default async function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 p-4">
          <SidebarTrigger />
        </header>
        <main className="flex w-full flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
