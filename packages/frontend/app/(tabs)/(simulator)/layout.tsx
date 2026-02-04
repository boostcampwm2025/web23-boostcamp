export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  );
}
