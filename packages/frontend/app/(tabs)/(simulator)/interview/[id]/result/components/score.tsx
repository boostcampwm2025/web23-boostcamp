export default function Score({ score }: { score?: number }) {
  return (
    <>
      <span className="text-sm font-bold tracking-wide text-black/20 uppercase">
        Final Score
      </span>
      <div className="flex flex-row items-baseline gap-2">
        <h1 className="text-6xl font-bold">{score ?? 0}</h1>
        <h3 className="text-lg font-bold text-black/20">/100</h3>
      </div>
    </>
  );
}
