"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

import "server-only";

interface SessionContent {
  user?: {
    id: number;
    email: string;
  };
}

export async function getUserSession() {
  const cookie = await cookies();

  return await getIronSession<SessionContent>(cookie, {
    password: process.env.SESSION_PASSWORD as string,
    cookieName: "user-session",
  });
}
