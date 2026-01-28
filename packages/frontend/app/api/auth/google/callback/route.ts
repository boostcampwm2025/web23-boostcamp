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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/oauth?code=${code}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const user = (await res.json()) as IOAuthResponse;

  const tokenPayload: ITokenPayload = JSON.parse(
    Buffer.from(user.accessToken.split(".")[1], "base64").toString(),
  );

  const userSession = await getUserSession();

  userSession.user = {
    id: +tokenPayload.sub,
    email: user.email ?? "test@email.com",
    token: user.accessToken,
    refreshToken: user.refreshToken,
  };

  await userSession.save();

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
