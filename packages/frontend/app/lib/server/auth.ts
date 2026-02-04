"use server";

import { redirect } from "next/navigation";
import { getUserSession } from "./session";

export async function authWithUserSession() {
  // 로그인 상태 확인
  const userSession = await getUserSession();
  // 로그인되어 있지 않다면 로그인 페이지로 redirect
  if (!userSession.user) {
    return redirect("/log-in");
  } else {
    return userSession;
  }
}

export async function destroyUserSession() {
  const userSession = await getUserSession();
  userSession.destroy();
  redirect("/");
}
