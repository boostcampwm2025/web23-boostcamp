import Header from "@/app/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Header />

      <main className="h-full w-full">{children}</main>
    </main>
  );
}
