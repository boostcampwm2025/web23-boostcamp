"use client";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export default function Profile({
  email,
  profileImage,
  logout,
}: {
  email: string;
  profileImage?: string;
  logout?: () => void;
}) {
  return (
    <div className="p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer ring-1 ring-primary transition-all hover:brightness-110">
            <AvatarImage src={profileImage} alt="profile_image" />
            <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
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
