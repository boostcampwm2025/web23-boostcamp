export default function AISummary({ summary }: { summary?: string }) {
  return (
    <>
      <h5 className="font-semibold tracking-wide text-primary">
        AI Executive Summary
      </h5>
      <span className="text-sm">{`"${summary}"`}</span>
    </>
  );
}
