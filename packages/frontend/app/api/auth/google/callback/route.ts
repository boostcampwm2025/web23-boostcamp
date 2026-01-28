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
    `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/oauth?code=${code}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const user = (await res.json()) as IOAuthResponse;

  const tokenPayload = JSON.parse(
    Buffer.from(user.accessToken.split(".")[1], "base64").toString(),
  );
  console.log(tokenPayload);

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
