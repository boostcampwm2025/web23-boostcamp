import { SidebarProvider } from "@/app/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="h-full w-full">{children}</main>
    </SidebarProvider>
  );
}
