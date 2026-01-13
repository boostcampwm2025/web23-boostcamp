import Header from "@/app/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="mt-16">{children}</div>
    </div>
  );
}
