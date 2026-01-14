import { SidebarProvider } from "@/app/components/ui/sidebar";
import { AppSidebar } from "@/app/(tabs)/dashboard/components/app_sidebar";
import Header from "@/app/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Header />
      <main className="mt-20 w-full">{children}</main>
    </SidebarProvider>
  );
}
