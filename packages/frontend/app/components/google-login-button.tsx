"use client";

export default function GoogleLoginButton() {
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login/google`;
  };

  return <button onClick={handleLogin}>Google 로그인</button>;
}
