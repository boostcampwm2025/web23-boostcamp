import { redirect } from "next/navigation";
import { getUserSession } from "../lib/server/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();

  if (!session.user || !session.user.token) {
    redirect("/login");
  }

  return children;
}
