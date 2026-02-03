import Header from "@/app/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex-1">{children}</div>
    </div>
  );
}
