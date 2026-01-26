import { unstable_cache as nextCache } from "next/cache";

import { getInterviews } from "./actions";
import InterviewList from "./components/interview-list";
import InterviewStartBox from "./components/interview-start-box";
import InterviewWelomeHeader from "./components/interview-welcome-header";
import Tip from "../(simulator)/interview/[id]/result/components/tip";

const getCachedInterviews = nextCache(getInterviews, [
  "interviews_dashboard_page",
]);

export default async function Page() {
  const { interviews } = await getCachedInterviews();

  return (
    <div>
      <main className="mx-auto max-w-180">
        <div className="mt-12">
          <InterviewWelomeHeader />
        </div>
        <div className="mt-8">
          <InterviewStartBox />
        </div>
        <div className="mt-12">
          <InterviewList interviews={interviews} />
        </div>
        <div className="mt-12">
          <div className="rounded-2xl bg-primary/10 p-5">
            <Tip />
          </div>
        </div>
      </main>
    </div>
  );
}
