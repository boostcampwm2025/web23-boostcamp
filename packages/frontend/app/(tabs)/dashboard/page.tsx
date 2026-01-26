import { SidebarProvider } from "@/app/components/ui/sidebar";

import { unstable_cache as nextCache } from "next/cache";
import { getInterviews } from "./actions";
import { Card } from "@/app/components/ui/card";

const getCachedInterviews = nextCache(getInterviews, [
  "interviews_dashboard_page",
]);

export default async function Page() {
  const { interviews, totalPages } = await getCachedInterviews();

  return (
    <div>
      <main>
        <div className="mx-auto">Dashboard Content</div>
        <Card />
      </main>
    </div>
  );
}
