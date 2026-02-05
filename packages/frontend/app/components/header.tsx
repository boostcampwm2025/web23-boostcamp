import Link from "next/link";
import { MountainSnow, Waypoints } from "lucide-react";

import Profile from "@/app/components/profile";
import { logout } from "../(auth)/actions/auth";
import { getUserSession } from "../lib/server/session";

export default async function Header() {
  const { user } = await getUserSession();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-white/70 px-12 py-3 backdrop-blur-md">
      <nav>
        <Link
          href="/dashboard"
          aria-label="Synapse"
          className="flex items-center gap-2 font-semibold"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Waypoints className="size-4" />
          </div>
          <span className="text-xl font-semibold text-primary uppercase">
            Synapse
          </span>
        </Link>

        {/* <AutoBreadcrumb /> */}
      </nav>
      <nav>
        {user && (
          <Profile
            profileImage={user.profileUrl || undefined}
            email={user.email}
            logout={logout}
          />
        )}
      </nav>
    </header>
  );
}
