import clsx from "clsx";

export default function IconBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex size-10 items-center justify-center rounded-md bg-primary/10",
        className,
      )}
    >
      {children}
    </div>
  );
}
