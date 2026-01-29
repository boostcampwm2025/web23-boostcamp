"use client";

import { useTransition } from "react";
import { Chrome, Loader } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { googleLogin } from "../actions/auth";

export default function GoogleLoginButton() {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      await googleLogin();
    });
  };

  return (
    <Button
      onClick={onClick}
      disabled={isPending}
      className="cursor-pointer rounded-md border px-3 py-2.5 text-sm shadow-md shadow-primary/20"
    >
      {isPending ? (
        <Loader className="animate-spin" />
      ) : (
        <div className="flex items-center gap-2">
          <Chrome />
          <p>Google 로그인</p>
        </div>
      )}
    </Button>
  );
}
