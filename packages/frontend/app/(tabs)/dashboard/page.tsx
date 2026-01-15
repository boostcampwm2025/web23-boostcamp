import {
  /* Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader, */
  SidebarProvider,
} from "@/app/components/ui/sidebar";
import { AppSidebar } from "./components/app_sidebar";

export default function Page() {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <div className="mx-auto mt-20 grid max-w-7xl grid-cols-1 gap-4 md:max-w-2xl lg:grid-cols-12 2xl:max-w-428">
            Dashboard Content
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
