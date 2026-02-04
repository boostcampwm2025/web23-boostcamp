import { unstable_cache as nextCache } from "next/cache";
import { redirect } from "next/navigation";

import { getInterviews } from "./actions";
import { getUserSession } from "@/app/lib/server/session";

import InterviewList from "./components/interview-list";
import InterviewStartBox from "./components/interview-start-box";
import InterviewWelomeHeader from "./components/interview-welcome-header";
import Tip from "@/app/(tabs)/(sidebar)/interview/[id]/result/components/tip";

export const dynamic = "force-dynamic";

const getCachedInterviews = nextCache(getInterviews, [
  "interviews_dashboard_page",
]);

export default async function Page() {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const interviews = await getInterviews();

  return (
    <section className="mx-auto w-full max-w-3xl px-5 pb-5">
      <div className="mt-12">
        <InterviewWelomeHeader username={user.email} />
      </div>
      <div className="mt-8">
        <InterviewStartBox href="/interview/create" />
      </div>
      {interviews.length > 0 && (
        <div className="mt-12">
          <InterviewList interviews={interviews} />
        </div>
      )}
      <div className="mt-12">
        <div className="rounded-2xl bg-primary/10 p-5">
          <Tip />
        </div>
      </div>
    </section>
  );
}
