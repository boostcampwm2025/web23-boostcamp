import Link from "next/link";
import { MountainSnow } from "lucide-react";

import Profile from "@/app/components/profile";
import { logout } from "../(auth)/actions/auth";
import { getUserSession } from "../lib/server/session";
import GoogleLoginButton from "../(auth)/components/google-login-button";

export default async function Header() {
  const { user } = await getUserSession();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-white/70 px-12 py-4 backdrop-blur-md">
      <nav className="flex items-center gap-4 font-semibold">
        <h1>
          <Link href={"/"} className="flex items-center">
            <div className="rounded-lg bg-black/5 p-1.5">
              <MountainSnow className="text-primary" />
            </div>
            <span className="ml-2 text-xl text-primary">PSI</span>
          </Link>
        </h1>
        {/* <AutoBreadcrumb /> */}
      </nav>
      <nav>
        {user ? (
          <Profile email={user.email} logout={logout} />
        ) : (
          <GoogleLoginButton />
        )}
      </nav>
    </header>
  );
}
