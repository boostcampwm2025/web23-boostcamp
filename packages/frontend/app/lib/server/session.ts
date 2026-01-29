"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

import "server-only";

interface ISessionContent {
  user?: {
    id: number;
    email: string;
    token: string;
    refreshToken: string;
  };
}

export async function getUserSession() {
  const cookie = await cookies();

  return await getIronSession<ISessionContent>(cookie, {
    password: process.env.SESSION_PASSWORD as string,
    cookieName: "user-session",
  });
}
