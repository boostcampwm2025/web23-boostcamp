import Link from "next/link";
import { redirect } from "next/navigation";
import { MountainSnow } from "lucide-react";

import AutoBreadcrumb from "@/app/components/auto-breadcrumb";
import Profile from "@/app/components/profile";
import { logout } from "../(auth)/actions/auth";
import { getUserSession } from "../lib/server/session";

export default async function Header() {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-white/70 px-6 py-1.5 shadow-sm backdrop-blur-md">
      <nav className="flex items-center gap-4 font-semibold">
        <h1>
          <Link href={"/"}>
            <MountainSnow className="text-primary" />
          </Link>
        </h1>
        <AutoBreadcrumb />
      </nav>
      <nav>
        <Profile email={user.email} logout={logout} />
      </nav>
    </header>
  );
}
