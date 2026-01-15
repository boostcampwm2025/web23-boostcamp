import Header from "@/app/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="size-full h-full px-6">{children}</div>
    </div>
  );
}
