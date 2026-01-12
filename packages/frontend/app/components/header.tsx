
import Link from "next/link";
import { MountainSnow } from "lucide-react";

import AutoBreadcrumb from "@/app/components/auto_breadcrumb";
import Profile from "@/app/components/profile";

import { logout } from "@/app/actions/auth";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-4">
      <nav className="flex items-center gap-4 font-semibold">
        <h1>
          <Link href={"/"}>
            <MountainSnow />
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
