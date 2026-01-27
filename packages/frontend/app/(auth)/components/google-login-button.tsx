"use client";

import { GoogleLogin } from "../actions/auth";

export default function GoogleLoginButton() {
  return <button onClick={GoogleLogin}>Google 로그인</button>;
}
