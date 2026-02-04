export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex size-full items-start lg:mt-0 lg:items-center">
      {children}
    </div>
  );
}
