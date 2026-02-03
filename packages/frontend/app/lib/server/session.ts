"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

import "server-only";

import { isDevAuthEnabled } from "./env";

interface ISessionContent {
  user?: {
    id: string;
    email: string;
    profileUrl: string | null;
    token: string;
    refreshToken: string;
  };
}

type IronSessionType = Awaited<
  ReturnType<typeof getIronSession<ISessionContent>>
>;

const DEV_USER_SESSION: ISessionContent["user"] = {
  id: "dev-user",
  email: "dev@localhost",
  profileUrl: null,
  token: "dev-token",
  refreshToken: "dev-refresh",
};

function createDevSession(): IronSessionType {
  return {
    user: DEV_USER_SESSION,
    destroy: () => {},
  } as unknown as IronSessionType;
}

export async function getUserSession() {
  const cookie = await cookies();

  if (isDevAuthEnabled()) {
    return createDevSession();
  }

  const sessionPassword = process.env.SESSION_PASSWORD;

  if (!sessionPassword || sessionPassword.length < 32) {
    throw new Error(
      "Invalid SESSION_PASSWORD: iron-session requires a password at least 32 characters long.",
    );
  }

  return await getIronSession<ISessionContent>(cookie, {
    password: sessionPassword,
    cookieName: "user-session",
  });
}
