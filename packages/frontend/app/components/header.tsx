import Link from "next/link";
import { MountainSnow } from "lucide-react";

import AutoBreadcrumb from "@/app/components/auto_breadcrumb";
import Profile from "@/app/components/profile";

import { logout } from "@/app/actions/auth";

export default function Header() {
  return (
    <header className="fixed top-0 flex w-full items-center justify-between border-b bg-white px-6 py-1.5 shadow-sm backdrop-blur-md">
      <nav className="flex items-center gap-4 font-semibold">
        <h1>
          <Link href={"/"}>
            <MountainSnow className="text-primary" />
          </Link>
        </h1>
        <AutoBreadcrumb />
      </nav>
      <nav>
        <Profile email="1234@gmail.com" logout={logout} />
      </nav>
    </header>
  );
}
