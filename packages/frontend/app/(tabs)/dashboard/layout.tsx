import { SidebarProvider } from "@/app/components/ui/sidebar";
import Header from "@/app/components/header";

import { AppSidebar } from "@/app/(tabs)/dashboard/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Header />
      <SidebarProvider>
        <AppSidebar />
        <main className="h-full w-full">{children}</main>
      </SidebarProvider>
    </main>
  );
}
