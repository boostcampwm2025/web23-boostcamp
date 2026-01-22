import Header from "@/app/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <div className="flex-1 px-6">{children}</div>
    </div>
  );
}
