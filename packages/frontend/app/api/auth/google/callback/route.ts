"use server";

import { NextResponse } from "next/server";
import { getUserSession } from "@/app/lib/server/session";

interface IOAuthResponse {
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface ITokenPayload {
  exp: number;
  iat: number;
  sub: string;
  role: "USER" | "ADMIN";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const oauthRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/oauth?code=${code}`,
    {
      method: "GET",
    },
  );

  if (!oauthRes.ok) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const token = (await oauthRes.json()) as IOAuthResponse;

  const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
  });

  const user = (await userRes.json()) as {
    userId: string;
    email: string;
    profileUrl: string | null;
  };

  const userSession = await getUserSession();

  userSession.user = {
    id: user.userId,
    email: user.email,
    profileUrl: user.profileUrl,
    token: token.accessToken,
    refreshToken: token.refreshToken,
  };
  await userSession.save();

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
