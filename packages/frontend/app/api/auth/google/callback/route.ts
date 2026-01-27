"use server";

import { getUserSession } from "@/app/lib/server/session";
import { NextResponse } from "next/server";

interface IOAuthResponse {
  userId: number;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup/oauth`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "google",
        code,
      }),
    },
  );

  if (!res.ok) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const user = (await res.json()) as IOAuthResponse;

  const userSession = await getUserSession();

  userSession.user = {
    id: user.userId,
    email: user.email,
    token: user.accessToken,
    refreshToken: user.refreshToken,
  };

  await userSession.save();

  return NextResponse.redirect(new URL("/", req.url));
}
