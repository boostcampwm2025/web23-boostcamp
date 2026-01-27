import DevLoginButton from "./(auth)/components/dev-login";
import GoogleLoginButton from "./(auth)/components/google-login-button";
import LogoutButton from "./(auth)/components/logout-button";
import { getUserSession } from "./lib/server/session";

export default async function Home() {
  const session = await getUserSession();

  return (
    <div className="bg-red-50">
      <GoogleLoginButton />
      <DevLoginButton />
      <LogoutButton />
    </div>
  );
}
