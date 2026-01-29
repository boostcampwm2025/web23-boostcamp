"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import Image from "next/image";
import { useState } from "react";

export default function Profile({
  email,
  profileImage,
  logout,
}: {
  email: string;
  profileImage?: string;
  logout?: () => void;
}) {
  const [error, setError] = useState(false);

  return (
    <div className="p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative cursor-pointer overflow-hidden rounded-md ring-1 ring-primary transition-all hover:brightness-110">
            <Image
              src={profileImage || "/default-profile.png"}
              alt="profile_image"
              width={32}
              height={32}
              className="z-10 object-cover"
              onError={() => setError(true)}
            />
            {error ?? (
              <p className="absolute inset-0 flex items-center justify-center font-bold text-white">
                {email.charAt(0).toUpperCase()}
              </p>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="m-1 w-56" align="start">
          <DropdownMenuLabel>Email</DropdownMenuLabel>
          <DropdownMenuItem>{email}</DropdownMenuItem>

          {/* <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Theme</DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
