export default function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
      {children}
    </div>
  );
}
