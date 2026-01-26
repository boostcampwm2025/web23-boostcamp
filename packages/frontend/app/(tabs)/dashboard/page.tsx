import { unstable_cache as nextCache } from "next/cache";

import { getInterviews } from "./actions";
import InterviewList from "./components/interview-list";
import InterviewStartBox from "./components/interview-start-box";

const getCachedInterviews = nextCache(getInterviews, [
  "interviews_dashboard_page",
]);

export default async function Page() {
  const { interviews } = await getCachedInterviews();

  return (
    <div>
      <main className="mx-auto max-w-180">
        <div className="mt-12">
          <InterviewStartBox />
        </div>
        <div className="mt-12">
          <InterviewList interviews={interviews} />
        </div>
      </main>
    </div>
  );
}
