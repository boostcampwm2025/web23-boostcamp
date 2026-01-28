import { unstable_cache as nextCache } from "next/cache";
import { redirect } from "next/navigation";

import { getInterviews } from "./actions";
import { getUserSession } from "@/app/lib/server/session";

import InterviewList from "./components/interview-list";
import InterviewStartBox from "./components/interview-start-box";
import InterviewWelomeHeader from "./components/interview-welcome-header";
import Tip from "../(simulator)/interview/[id]/result/components/tip";

const getCachedInterviews = nextCache(getInterviews, [
  "interviews_dashboard_page",
]);

export default async function Page() {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const { interviews } = await getInterviews();

  return (
    <div>
      <main className="mx-auto max-w-180 px-5">
        <div className="mt-12">
          <InterviewWelomeHeader username={user.email} />
        </div>
        <div className="mt-8">
          <InterviewStartBox href="/interview/create" />
        </div>
        <div className="mt-12">
          {/* FIXME: 이후에 interview 리스트 가 없을경우 or [] 인경우 */}
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
