"use server";

import { redirect } from "next/navigation";
import { getUserSession } from "@/app/lib/server/session";

export async function logout() {
  const userSession = await getUserSession();
  userSession.destroy();

  redirect("/");
}

interface IGoogleLoginResponse {
  url: string;
}
export async function googleLogin() {
  const { url: loginUrl } = (await (
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/url/google`)
  ).json()) as IGoogleLoginResponse;
  redirect(loginUrl);
}

export async function devLogin() {
  const userSession = await getUserSession();
  userSession.user = {
    id: "1",
    email: "anoy@dev.com",
    token: "dev-token",
    refreshToken: "dev-refresh-token",
    profileUrl: "",
  };
  await userSession.save();

  redirect("/dashboard");
}
