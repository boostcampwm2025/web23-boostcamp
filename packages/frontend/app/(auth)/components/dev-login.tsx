// 개발자 전용으로 임시로 만든 버튼입니다.

"use client";

import { DevLogin } from "../actions/auth";

export default function DevLoginButton() {
  return <button onClick={DevLogin}>개발자 로그인</button>;
}
