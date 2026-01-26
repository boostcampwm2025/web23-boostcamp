import { unstable_cache as nextCache } from "next/cache";
import { ChevronRight, ClipboardList, Clock, Sparkle } from "lucide-react";

import IconBox from "@/app/components/ui/icon-box";

import { getInterviews } from "./actions";
import InterviewList from "./components/interview-list";

const getCachedInterviews = nextCache(getInterviews, [
  "interviews_dashboard_page",
]);

export default async function Page() {
  const { interviews, totalPages } = await getCachedInterviews();
  console.log(interviews, totalPages);
  return (
    <div>
      <main className="mx-auto max-w-180">
        <InterviewList interviews={interviews} />
      </main>
    </div>
  );
}
